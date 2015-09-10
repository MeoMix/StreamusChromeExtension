import Dialog from 'foreground/model/dialog/dialog';
import EditPlaylistView from 'foreground/view/dialog/editPlaylistView';
import EditPlaylist from 'foreground/model/dialog/editPlaylist';
import DialogView from 'foreground/view/dialog/dialogView';

var EditPlaylistDialogView = DialogView.extend({
  id: 'editPlaylistDialog',

  initialize: function(options) {
    this.model = new Dialog({
      submitButtonText: chrome.i18n.getMessage('update')
    });

    this.contentView = new EditPlaylistView({
      model: new EditPlaylist({
        playlist: options.playlist
      })
    });

    DialogView.prototype.initialize.apply(this, arguments);
  },

  onSubmit: function() {
    this.contentView.editPlaylist();
  }
});

export default EditPlaylistDialogView;