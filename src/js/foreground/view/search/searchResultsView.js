import {CompositeView} from 'marionette';
import ListItemType from 'common/enum/listItemType';
import CollectionViewMultiSelect from 'foreground/view/behavior/collectionViewMultiSelect';
import Scrollable from 'foreground/view/behavior/scrollable';
import SlidingRender from 'foreground/view/behavior/slidingRender';
import Sortable from 'foreground/view/behavior/sortable';
import Tooltipable from 'foreground/view/behavior/tooltipable';
import SearchResultView from 'foreground/view/search/searchResultView';
import searchResultsTemplate from 'template/search/searchResults.hbs!';

var SearchResultsView = CompositeView.extend({
  id: 'searchResults',
  className: 'list u-flex--full',
  template: searchResultsTemplate,
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

export default SearchResultsView;