import {Model} from 'backbone';
import DeletePlaylistDialogView from 'foreground/view/dialog/deletePlaylistDialogView';
import EditPlaylistDialogView from 'foreground/view/dialog/editPlaylistDialogView';
import ExportPlaylistDialogView from 'foreground/view/dialog/exportPlaylistDialogView';

var PlaylistActions = Model.extend({
  showContextMenu: function(playlist, top, left) {
    var isEmpty = playlist.get('items').isEmpty();

    StreamusFG.channels.simpleMenu.commands.trigger('show:simpleMenu', {
      isContextMenu: true,
      top: top,
      left: left,
      simpleMenuItems: [{
        text: chrome.i18n.getMessage('edit'),
        onClick: this._showEditPlaylistDialog.bind(this, playlist)
      }, {
        // No point in sharing an empty playlist.
        disabled: isEmpty,
        text: chrome.i18n.getMessage('copyUrl'),
        onClick: this._copyPlaylistUrl.bind(this, playlist)
      }, {
        // No point in exporting an empty playlist.
        disabled: isEmpty,
        text: chrome.i18n.getMessage('exportToYouTube'),
        onClick: this._exportToYouTube.bind(this, playlist)
      }, {
        // No point in exporting an empty playlist.
        disabled: isEmpty,
        text: chrome.i18n.getMessage('export'),
        onClick: this._showExportPlaylistDialog.bind(this, playlist)
      }]
    });
  },

  deletePlaylist: function(playlist) {
    // No need to notify if the playlist is empty.
    if (playlist.get('items').length === 0) {
      playlist.destroy();
    } else {
      this._showDeletePlaylistDialog.call(this, playlist);
    }
  },

  _copyPlaylistUrl: function(playlist) {
    playlist.getShareCode({
      success: this._onGetShareCodeSuccess,
      error: this._onGetShareCodeError
    });
  },

  _onGetShareCodeSuccess: function(shareCode) {
    shareCode.copyUrl();

    StreamusFG.channels.notification.commands.trigger('show:notification', {
      message: chrome.i18n.getMessage('urlCopied')
    });
  },

  _onGetShareCodeError: function() {
    StreamusFG.channels.notification.commands.trigger('show:notification', {
      message: chrome.i18n.getMessage('copyFailed')
    });
  },

  _showDeletePlaylistDialog: function(playlist) {
    StreamusFG.channels.dialog.commands.trigger('show:dialog', DeletePlaylistDialogView, {
      playlist: playlist
    });
  },

  _showEditPlaylistDialog: function(playlist) {
    StreamusFG.channels.dialog.commands.trigger('show:dialog', EditPlaylistDialogView, {
      playlist: playlist
    });
  },

  _exportToYouTube: function(playlist) {
    playlist.exportToYouTube();
  },

  _showExportPlaylistDialog: function(playlist) {
    StreamusFG.channels.dialog.commands.trigger('show:dialog', ExportPlaylistDialogView, {
      playlist: playlist
    });
  }
});

export default PlaylistActions;