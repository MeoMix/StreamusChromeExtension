'use strict';
import Dialog from 'foreground/model/dialog/dialog';
import CreatePlaylistView from 'foreground/view/dialog/createPlaylistView';
import CreatePlaylist from 'foreground/model/dialog/createPlaylist';
import DialogView from 'foreground/view/dialog/dialogView';

var CreatePlaylistDialogView = DialogView.extend({
  id: 'createPlaylistDialog',

  initialize: function(options) {
    this.model = new Dialog({
      submitButtonText: chrome.i18n.getMessage('create')
    });

    this.contentView = new CreatePlaylistView({
      model: new CreatePlaylist(),
      dataSourceManager: StreamusFG.backgroundProperties.dataSourceManager,
      playlists: options.playlists,
      videos: _.isUndefined(options.videos) ? [] : options.videos
    });

    DialogView.prototype.initialize.apply(this, arguments);
  },

  onSubmit: function() {
    this.contentView.createPlaylist();
  }
});

export default CreatePlaylistDialogView;