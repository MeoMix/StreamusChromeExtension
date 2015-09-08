import _ from 'common/shim/lodash.reference.shim';
import {CompositeView} from 'marionette';
import ListItemType from 'common/enum/listItemType';
import CollectionViewMultiSelect from 'foreground/view/behavior/collectionViewMultiSelect';
import Scrollable from 'foreground/view/behavior/scrollable';
import SlidingRender from 'foreground/view/behavior/slidingRender';
import Sortable from 'foreground/view/behavior/sortable';
import PlaylistItemView from 'foreground/view/leftPane/playlistItemView';
import PlaylistItemsTemplate from 'template/leftPane/playlistItems.html!text';

var PlaylistItemsView = CompositeView.extend({
  id: 'playlistItems',
  className: 'list u-flex--full',
  childViewContainer: '@ui.listItems',
  childView: PlaylistItemView,
  childViewType: ListItemType.PlaylistItem,
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

  template: _.template(PlaylistItemsTemplate),

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
    }
  },

  initialize: function() {
    this.listenTo(StreamusFG.channels.search.vent, 'showing', this._onSearchShowing);
  },

  // Don't maintain selected results after showing SearchView because this view won't be visible.
  _onSearchShowing: function() {
    this.triggerMethod('deselect:collection');
  }
});

export default PlaylistItemsView;