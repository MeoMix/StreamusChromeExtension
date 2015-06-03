define(function(require) {
  'use strict';

  var CreatePlaylistDialogView = require('foreground/view/dialog/createPlaylistDialogView');

  var SongActions = Backbone.Model.extend({
    showSaveMenu: function(songs, top, left, playlists) {
      songs = songs instanceof Backbone.Collection ? songs.models : _.isArray(songs) ? songs : [songs];

      var simpleMenuItems = playlists.map(function(playlist) {
        return {
          active: playlist.get('active'),
          text: playlist.get('title'),
          value: playlist.get('id'),
          onClick: function(model) {
            var playlistId = model.get('value');
            playlists.get(playlistId).get('items').addSongs(songs);
          }.bind(this)
        };
      }, this);

      StreamusFG.channels.simpleMenu.commands.trigger('show:simpleMenu', {
        top: top,
        left: left,
        simpleMenuItems: simpleMenuItems,
        fixedMenuItem: {
          text: chrome.i18n.getMessage('createPlaylist'),
          onClick: function() {
            StreamusFG.channels.dialog.commands.trigger('show:dialog', CreatePlaylistDialogView, {
              songs: songs,
              playlists: playlists
            });
          }.bind(this)
        }
      });
    },

    showContextMenu: function(song, top, left, player) {
      StreamusFG.channels.simpleMenu.commands.trigger('show:simpleMenu', {
        isContextMenu: true,
        top: top,
        left: left,
        simpleMenuItems: [{
          text: chrome.i18n.getMessage('copyUrl'),
          onClick: function() {
            song.copyUrl();
          }.bind(this)
        }, {
          text: chrome.i18n.getMessage('copyTitleAndUrl'),
          onClick: function() {
            song.copyTitleAndUrl();
          }.bind(this)
        }, {
          text: chrome.i18n.getMessage('watchOnYouTube'),
          onClick: function() {
            player.watchInTab(song);
          }.bind(this)
        }]
      });
    }
  });

  return SongActions;
});