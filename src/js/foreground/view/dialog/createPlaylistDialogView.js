define(function(require) {
  'use strict';

  var Dialog = require('foreground/model/dialog/dialog');
  var CreatePlaylistView = require('foreground/view/dialog/createPlaylistView');
  var CreatePlaylist = require('foreground/model/dialog/createPlaylist');
  var DialogView = require('foreground/view/dialog/dialogView');

  var CreatePlaylistDialogView = DialogView.extend({
    id: 'createPlaylistDialog',

    initialize: function(options) {
      this.model = new Dialog({
        submitButtonText: chrome.i18n.getMessage('create')
      });

      this.contentView = new CreatePlaylistView({
        model: new CreatePlaylist(),
        dataSourceManager: StreamusFG.backgroundPage.dataSourceManager,
        playlists: options.playlists,
        songs: _.isUndefined(options.songs) ? [] : options.songs
      });

      DialogView.prototype.initialize.apply(this, arguments);
    },

    onSubmit: function() {
      this.contentView.createPlaylist();
    }
  });

  return CreatePlaylistDialogView;
});