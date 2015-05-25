define(function(require) {
  'use strict';

  var ListItemType = require('common/enum/listItemType');
  var CollectionViewMultiSelect = require('foreground/view/behavior/collectionViewMultiSelect');
  var Scrollable = require('foreground/view/behavior/scrollable');
  var SlidingRender = require('foreground/view/behavior/slidingRender');
  var Sortable = require('foreground/view/behavior/sortable');
  var Tooltipable = require('foreground/view/behavior/tooltipable');
  var StreamItemView = require('foreground/view/stream/streamItemView');
  var StreamItemsTemplate = require('text!template/stream/streamItems.html');

  var StreamItemsView = Marionette.CompositeView.extend({
    id: 'streamItems',
    className: 'list u-flex--full u-bordered--left',
    childViewContainer: '@ui.listItems',
    childView: StreamItemView,
    childViewType: ListItemType.StreamItem,
    childViewOptions: function() {
      return {
        player: Streamus.backgroundPage.player,
        playPauseButton: Streamus.backgroundPage.playPauseButton,
        type: this.childViewType,
        parentId: this.ui.listItems[0].id
      };
    },

    // Overwrite resortView to only render children as expected
    resortView: function() {
      this._renderChildren();
    },

    template: _.template(StreamItemsTemplate),

    ui: {
      listItems: '[data-ui~=listItems]'
    },

    behaviors: {
      CollectionViewMultiSelect: {
        behaviorClass: CollectionViewMultiSelect
      },
      Scrollable: {
        behaviorClass: Scrollable,
        implementsSlidingRender: true
      },
      SlidingRender: {
        behaviorClass: SlidingRender
      },
      Sortable: {
        behaviorClass: Sortable
      },
      Tooltipable: {
        behaviorClass: Tooltipable
      }
    },

    activeStreamItemAreaEvents: {
      'beforeVisible': '_onActiveStreamItemAreaBeforeVisible',
      'visible': '_onActiveStreamItemAreaVisible',
      'hidden': '_onActiveStreamItemAreaHidden'
    },

    initialize: function() {
      this.bindEntityEvents(Streamus.channels.activeStreamItemArea.vent, this.activeStreamItemAreaEvents);
    },

    _onActiveStreamItemAreaBeforeVisible: function() {
      // TODO: Check this. Still feels really weird.
      // Height isn't updated until children are rendered.
      setTimeout(function() {
        // If the content isn't going to have a scrollbar later then add a class to ensure that
        // a scrollbar doesn't shown for a second as the content transitions in.
        if (this.ui.listItems.height() <= this.$el.height()) {
          this.ui.listItems.addClass('is-heightRestricted');
        }
      }.bind(this));
    },

    _onActiveStreamItemAreaVisible: function() {
      this.ui.listItems.removeClass('is-heightRestricted');
      this.triggerMethod('ListHeightUpdated');
    },

    _onActiveStreamItemAreaHidden: function() {
      this.triggerMethod('ListHeightUpdated');
    }
  });

  return StreamItemsView;
});