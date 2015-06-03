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
        player: StreamusFG.backgroundProperties.player,
        playPauseButton: StreamusFG.backgroundProperties.playPauseButton,
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
      'visible': '_onActiveStreamItemAreaVisible',
      'hidden': '_onActiveStreamItemAreaHidden'
    },

    initialize: function() {
      this.bindEntityEvents(StreamusFG.channels.activeStreamItemArea.vent, this.activeStreamItemAreaEvents);
    },

    _onActiveStreamItemAreaVisible: function() {
      this.triggerMethod('ListHeightUpdated');
    },

    _onActiveStreamItemAreaHidden: function() {
      this.triggerMethod('ListHeightUpdated');
    }
  });

  return StreamItemsView;
});