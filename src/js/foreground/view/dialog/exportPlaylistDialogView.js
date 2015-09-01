'use strict';
import ExportPlaylist from 'foreground/model/dialog/exportPlaylist';
import Dialog from 'foreground/model/dialog/dialog';
import ExportPlaylistView from 'foreground/view/dialog/exportPlaylistView';
import DialogView from 'foreground/view/dialog/dialogView';

var ExportPlaylistDialogView = DialogView.extend({
  id: 'exportPlaylistDialog',

  initialize: function(options) {
    this.model = new Dialog({
      submitButtonText: chrome.i18n.getMessage('export')
    });

    this.contentView = new ExportPlaylistView({
      model: new ExportPlaylist({
        playlist: options.playlist
      })
    });

    DialogView.prototype.initialize.apply(this, arguments);
  },

  onSubmit: function() {
    this.contentView.saveAndExport();
  }
});

export default ExportPlaylistDialogView;