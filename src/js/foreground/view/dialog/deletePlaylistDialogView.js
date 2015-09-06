import Dialog from 'foreground/model/dialog/dialog';
import DeletePlaylistView from 'foreground/view/dialog/deletePlaylistView';
import DialogView from 'foreground/view/dialog/dialogView';

var DeletePlaylistDialogView = DialogView.extend({
  id: 'deletePlaylistDialog',

  initialize: function(options) {
    this.model = new Dialog({
      submitButtonText: chrome.i18n.getMessage('delete'),
      reminderProperty: 'remindDeletePlaylist'
    });

    this.contentView = new DeletePlaylistView({
      model: options.playlist
    });

    DialogView.prototype.initialize.apply(this, arguments);
  },

  onSubmit: function() {
    this.contentView.deletePlaylist();
  }
});

export default DeletePlaylistDialogView;