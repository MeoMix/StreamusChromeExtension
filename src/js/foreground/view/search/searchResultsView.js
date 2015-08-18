define(function(require) {
  'use strict';

  var ListItemType = require('common/enum/listItemType');
  var CollectionViewMultiSelect = require('foreground/view/behavior/collectionViewMultiSelect');
  var Scrollable = require('foreground/view/behavior/scrollable');
  var SlidingRender = require('foreground/view/behavior/slidingRender');
  var Sortable = require('foreground/view/behavior/sortable');
  var Tooltipable = require('foreground/view/behavior/tooltipable');
  var SearchResultView = require('foreground/view/search/searchResultView');
  var SearchResultsTemplate = require('text!template/search/searchResults.html');

  var SearchResultsView = Marionette.CompositeView.extend({
    id: 'searchResults',
    className: 'list u-flex--full',
    childViewContainer: '@ui.listItems',
    childView: SearchResultView,
    childViewType: ListItemType.SearchResult,
    childViewOptions: function() {
      return {
        streamItems: StreamusFG.backgroundProperties.stream.get('items'),
        player: StreamusFG.backgroundProperties.player,
        type: this.childViewType,
        parentId: this.ui.listItems[0].id
      };
    },

    // Overwrite resortView to only render children as expected
    resortView: function() {
      this._renderChildren();
    },

    template: _.template(SearchResultsTemplate),

    ui: {
      listItems: 'listItems'
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

    initialize: function() {
      this.listenTo(StreamusFG.channels.search.vent, 'hiding', this._onSearchHiding);
    },

    // Don't maintain selected results after closing the view because the view won't be visible.
    _onSearchHiding: function() {
      this.triggerMethod('deselect:collection');
    }
  });

  return SearchResultsView;
});