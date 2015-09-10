import _ from 'common/shim/lodash.reference.shim';
import {LayoutView} from 'marionette';
import PlaylistActions from 'foreground/model/playlist/playlistActions';
import ListItemButton from 'foreground/view/behavior/listItemButton';
import DeleteListItemButtonTemplate from 'template/listItemButton/deleteListItemButton.hbs!';
import DeleteIconTemplate from 'template/icon/deleteIcon_18.hbs!';

var DeletePlaylistButtonView = LayoutView.extend({
  template: DeleteListItemButtonTemplate,
  templateHelpers: {
    deleteIcon: DeleteIconTemplate
  },

  attributes: {
    'data-tooltip-text': chrome.i18n.getMessage('delete')
  },

  behaviors: {
    ListItemButton: {
      behaviorClass: ListItemButton
    }
  },

  playlist: null,

  initialize: function(options) {
    this.playlist = options.playlist;
    this._setState();

    // Ensure that the user isn't able to destroy the model more than once.
    this._deletePlaylist = _.once(this._deletePlaylist);
  },

  onClick: function() {
    this._deletePlaylist();
  },

  _deletePlaylist: function() {
    var playlistActions = new PlaylistActions();

    playlistActions.deletePlaylist(this.playlist);
  },

  _setState: function() {
    var canDelete = this.playlist.get('canDelete');

    var tooltipText;
    if (canDelete) {
      tooltipText = chrome.i18n.getMessage('delete');
    } else {
      tooltipText = chrome.i18n.getMessage('cantDeleteLastPlaylist');
    }

    this.$el.toggleClass('is-disabled', !canDelete).attr('data-tooltip-text', tooltipText);
    this.model.set('enabled', canDelete);
  }
});

export default DeletePlaylistButtonView;