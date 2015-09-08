import _ from 'common/shim/lodash.reference.shim';
import {CompositeView} from 'marionette';
import ListItemType from 'common/enum/listItemType';
import Scrollable from 'foreground/view/behavior/scrollable';
import Tooltipable from 'foreground/view/behavior/tooltipable';
import PlaylistView from 'foreground/view/playlist/playlistView';
import PlaylistsTemplate from 'template/playlist/playlists.html!text';

var PlaylistsView = CompositeView.extend({
  id: 'playlists',
  className: 'list u-flex--full',
  template: _.template(PlaylistsTemplate),

  childView: PlaylistView,
  childViewContainer: '@ui.listItems',
  childViewType: ListItemType.Playlist,
  childViewOptions: function() {
    return {
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

  triggers: {
    'click @ui.listItems': 'click:listItems'
  },

  behaviors: {
    Tooltipable: {
      behaviorClass: Tooltipable
    },
    Scrollable: {
      behaviorClass: Scrollable
    }
  },

  onRender: function() {
    this.ui.listItems.sortable(this._getSortableOptions());
  },

  _getSortableOptions: function() {
    var sortableOptions = {
      axis: 'y',
      delay: 100,
      containment: 'parent',
      tolerance: 'pointer',
      start: this._onSortableStart.bind(this),
      update: this._onSortableUpdate.bind(this)
    };

    return sortableOptions;
  },

  _onSortableStart: function() {
    StreamusFG.channels.element.vent.trigger('drag');
  },

  // Whenever a playlist is moved visually -- update corresponding model with new information.
  _onSortableUpdate: function(event, ui) {
    this.collection.moveToIndex(ui.item.attr('data-id'), ui.item.index());
  }
});

export default PlaylistsView;