'use strict';
import {Behavior} from 'marionette'
import ListItemType from 'common/enum/listItemType';
import 'lib/jquery-ui';

var Sortable = Behavior.extend({
  placeholderClass: 'sortable-placeholder',
  isDraggingClass: 'is-dragging',
  childViewHeight: 56,
  isDecorated: false,

  events: {
    'mouseenter': '_onMouseEnter',
    'mousedown': '_onMouseDown'
  },

  initialize: function() {
    this.listenTo(StreamusFG.channels.foregroundArea.vent, 'idle', this._onForegroundAreaIdle);
  },

  _onForegroundAreaIdle: function() {
    this._decorate();
  },

  _onMouseEnter: function() {
    this._decorate();
  },

  _onMouseDown: function() {
    // http://stackoverflow.com/questions/8869708/click-on-jquery-sortable-list-does-not-blur-input
    document.activeElement.blur();
  },

  _decorate: function() {
    // There's no reason to take this perf hit unless the user is actually going to use sortable logic.
    // So, only run it once the user could potentially need to do so.
    if (!this.isDecorated) {
      this.isDecorated = true;
      this.ui.listItems.sortable(this._getSortableOptions());
    }
  },

  _getSortableOptions: function() {
    var sortableOptions = {
      // Append to body so that the placeholder appears above all other elements instead of under when dragging between regions.
      appendTo: 'body',
      connectWith: '.js-droppable',
      cursorAt: {
        right: 32,
        bottom: 30
      },
      // Adding a delay helps preventing unwanted drags when clicking on an element.
      delay: 100,
      // NOTE: THIS IS A CUSTOM MODIFICATION TO JQUERY UI. Prevent hiding dragged views.
      hideOnDrag: false,
      placeholder: this.placeholderClass + ' listItem listItem--medium is-hidden',
      helper: this._helper.bind(this),
      change: this._change.bind(this),
      start: this._start.bind(this),
      stop: this._stop.bind(this),
      tolerance: 'pointer',
      receive: this._receive.bind(this),
      over: this._over.bind(this),
      out: this._out.bind(this),
      beforeStop: this._beforeStop.bind(this),
      mousedown: this._onMouseDown.bind(this)
    };

    return sortableOptions;
  },

  _helper: function() {
    return $('<span>', {
      'class': 'sortable-selectedItemsCount'
    });
  },

  _change: function(event, ui) {
    var isPlaceholderAdjacent = false;
    // When dragging an element up/down its own list -- hide the sortable helper around the element being dragged.
    var draggedItems = this.view.collection.getSelectedModels();
    // Only disallow moving to adjacent location if dragging one item because that'd be a no-op.
    if (draggedItems.length === 1) {
      var draggedModelId = draggedItems[0].get('id');
      var isNextModel = ui.placeholder.next().attr('data-id') === draggedModelId;
      var isPreviousModel = ui.placeholder.prev().attr('data-id') === draggedModelId;
      isPlaceholderAdjacent = isNextModel || isPreviousModel;
    }

    $('.' + this.placeholderClass).toggleClass('is-hidden', isPlaceholderAdjacent);

    this.ui.listItems.sortable('refresh');

    // Removing the placeholder modifies the container's height.
    // Notify the scrollbar to update because of this height change.
    this.view.triggerMethod('update:scrollbar');
  },

  _start: function(event, ui) {
    StreamusFG.channels.element.vent.trigger('drag');
    this.view.triggerMethod('item:dragged', {
      item: this.view.collection.get(ui.item.attr('data-id')),
      shiftKey: event.shiftKey
    });

    // Set helper text here, not in helper, because dragStart may select a search result.
    var selectedItems = this.view.collection.getSelectedModels();
    ui.helper.text(selectedItems.length);

    var draggedVideos = _.map(selectedItems, function(item) {
      return item.get('video');
    });

    this.ui.listItems.addClass(this.isDraggingClass).data({
      draggedVideos: draggedVideos
    });

    this._overrideSortableItem(ui);
  },

  // Placeholder stops being accessible once beforeStop finishes, so store its index here for use later.
  _beforeStop: function(event, ui) {
    // Subtract one from placeholderIndex when parentNode exists because jQuery UI moves the HTML element above the placeholder.
    this.ui.listItems.data({
      placeholderIndex: ui.placeholder.index() - 1
    });
  },

  _stop: function(event, ui) {
    var isParentNodeLost = _.isNull(ui.item[0].parentNode);

    // The SearchResult view is not able to be moved so disable move logic for it.
    // If the mouse dropped the items not over the given list don't run move logic.
    var allowMove = ui.item.data('type') !== ListItemType.SearchResult && this.ui.listItems.is(':hover');
    if (allowMove) {
      this.view.once('get:minRenderIndexResponse', function(response) {
        var dropIndex = this.ui.listItems.data('placeholderIndex') + response.minRenderIndex;
        this._moveItems(this.view.collection.getSelectedModels(), dropIndex, isParentNodeLost);
        this._cleanup();
      }.bind(this));
      this.view.triggerMethod('get:minRenderIndex');
    } else {
      // _.defer allows for jQuery UI to finish interacting with the element. Without this, CSS animations do not run.
      _.defer(function() {
        if (!this.view.isDestroyed) {
          this._cleanup();
        }
      }.bind(this));
    }

    // Return false to prevent jQuery UI from moving HTML.
    var removeHtmlElement = allowMove || isParentNodeLost;
    return removeHtmlElement;
  },

  _cleanup: function() {
    this.ui.listItems.removeData('draggedVideos placeholderIndex').removeClass(this.isDraggingClass);
    StreamusFG.channels.element.vent.trigger('drop');
  },

  _receive: function(event, ui) {
    // If the parentNode does not exist then slidingRender has removed the element.
    // If the element has been removed then the placeholder's index is off-by-one.
    // This only applies for receiving and not for sorting elements within the parent list.
    // Do not run this logic in onBeforeStop because it's unclear whether the action is sort or receive.
    var placeholderIndex = ui.sender.data('placeholderIndex');

    if (_.isNull(ui.item[0].parentNode)) {
      placeholderIndex += 1;
    }

    this.view.once('get:minRenderIndexResponse', function(response) {
      this.view.collection.addVideos(ui.sender.data('draggedVideos'), {
        index: placeholderIndex + response.minRenderIndex
      });

      // The collection does not resort because the model's index was provided when calling addVideos
      // The CollectionView's state is incorrect because the collection's index does not correspond to the view's child's index.
      // Simply triggering a sort is the simplest solution as it forces the CollectionView to re-render its children.
      this.view.collection.sort();
    }.bind(this));
    this.view.triggerMethod('get:minRenderIndex');
  },

  _over: function(event, ui) {
    this._overrideSortableItem(ui);
    this._decoratePlaceholder(ui);

    // Removing the placeholder modifies the container's height.
    // Notify the scrollbar to update because of this height change.
    this.view.triggerMethod('update:scrollbar');
  },

  _out: function() {
    // Removing the placeholder modifies the container's height.
    // Notify the scrollbar to update because of this height change.
    this.view.triggerMethod('update:scrollbar');
  },

  _moveItems: function(items, dropIndex, isParentNodeLost) {
    var moved = false;
    var itemsHandledBelowOrAtDropIndex = 0;
    var itemsHandled = 0;

    // Capture the indices of the items being moved before actually moving them because sorts on the collection will
    // change indices during each iteration.
    var dropInfoList = _.map(items, function(item) {
      return {
        itemId: item.get('id'),
        itemIndex: this.view.collection.indexOf(item)
      };
    }, this);

    _.each(dropInfoList, function(dropInfo) {
      var index = dropIndex;
      var aboveDropIndex = dropInfo.itemIndex > dropIndex;

      if (aboveDropIndex && isParentNodeLost) {
        index += 1;
      }

      // Moving items below the drop index causes indices to shift with each move.
      if (aboveDropIndex) {
        // Increment the target index to put the item an appropriate number of slots past dropIndex.
        index += itemsHandled;
        // Each item moved below the index doesn't count.
        // Subtract one to account for the item placed at dropIndex.
        if (itemsHandledBelowOrAtDropIndex > 0) {
          index -= (itemsHandledBelowOrAtDropIndex - 1);
        }
      }

      // Pass silent: true to prevent repeatedly refreshing the view.
      var moveResult = this.view.collection.moveToIndex(dropInfo.itemId, index, {
        silent: true
      });

      // When an item is moved down all the indices slide up one, so no need to increment.
      if (moveResult.moved) {
        moved = true;
      }

      if (!aboveDropIndex) {
        itemsHandledBelowOrAtDropIndex += 1;
      }

      itemsHandled++;
    }, this);

    if (moved) {
      // If a move happened call sort without silent so that views can update accordingly.
      this.view.collection.sort();
      // Need to update the scrollbar because if the drag-and-drop placeholder pushed scrollTop beyond its normal limits
      // then the scrollbar is not representing the correct height after the placeholder is removed.
      this.view.triggerMethod('update:scrollbar');
    }
  },

  _decoratePlaceholder: function(ui) {
    var notDroppable = false;
    var warnDroppable = false;
    var placeholderText = '';

    var overOtherCollection = this.view.childViewType !== ui.item.data('type');
    if (overOtherCollection) {
      // Decorate the placeholder to indicate videos can't be copied.
      var draggedVideos = ui.sender.data('draggedVideos');
      // Show a visual indicator if all dragged stream items are duplicates.
      var duplicatesInfo = this.view.collection.getDuplicatesInfo(draggedVideos);
      notDroppable = duplicatesInfo.allDuplicates;
      warnDroppable = duplicatesInfo.someDuplicates;
      placeholderText = duplicatesInfo.message;
    }

    var placeholderTextElement = $('<span>', {
      'class': 'u-marginAuto',
      text: placeholderText
    });

    ui.placeholder
        .toggleClass('is-notDroppable', notDroppable)
        .toggleClass('is-warnDroppable', warnDroppable)
        .html(placeholderTextElement);
  },

  // Override jQuery UI's sortableItem to allow a dragged item to scroll another sortable collection.
  // Need to re-call method on start to ensure that dragging still works inside normal parent collection, too.
  // http://stackoverflow.com/questions/11025470/jquery-ui-sortable-scrolling-jsfiddle-example
  _overrideSortableItem: function(ui) {
    var placeholderParent = ui.placeholder.parent().parent();
    var sortableItem = ui.item.data('sortableItem');

    // If the item being sorted has been unloaded by slidingRender behavior then sortableItem will be unavailable.
    // If unavailable, query the DOM for a reference to the sortable by its id.
    if (_.isUndefined(sortableItem)) {
      sortableItem = $('#' + ui.item.data('parentid')).sortable('instance');
    }

    sortableItem.scrollParent = placeholderParent;
    sortableItem.overflowOffset = placeholderParent.offset();
  }
});

export default Sortable;