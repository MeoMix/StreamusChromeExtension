import {Collection, Model} from 'backbone';
import CreatePlaylistDialogView from 'foreground/view/dialog/createPlaylistDialogView';
import FixedPosition from 'foreground/enum/fixedPosition';
// TODO: Naming
var VideoActions = Model.extend({
  showSaveMenu: function(videos, top, left, playlists) {
    videos = videos instanceof Collection ? videos.models : _.isArray(videos) ? videos : [videos];

    var simpleMenuItems = playlists.map(function(playlist) {
      return {
        active: playlist.get('active'),
        text: playlist.get('title'),
        value: playlist.get('id'),
        onClick: function(model) {
          var playlistId = model.get('value');
          playlists.get(playlistId).get('items').addVideos(videos);
        }.bind(this)
      };
    }, this);

    StreamusFG.channels.simpleMenu.commands.trigger('show:simpleMenu', {
      top: top,
      left: left,
      simpleMenuItems: simpleMenuItems,
      fixedMenuItem: {
        text: chrome.i18n.getMessage('createPlaylist'),
        fixedPosition: FixedPosition.Bottom,
        onClick: function() {
          StreamusFG.channels.dialog.commands.trigger('show:dialog', CreatePlaylistDialogView, {
            videos: videos,
            playlists: playlists
          });
        }.bind(this)
      }
    });
  },

  showContextMenu: function(video, top, left, player) {
    StreamusFG.channels.simpleMenu.commands.trigger('show:simpleMenu', {
      isContextMenu: true,
      top: top,
      left: left,
      simpleMenuItems: [{
        text: chrome.i18n.getMessage('copyUrl'),
        onClick: function() {
          video.copyUrl();
        }.bind(this)
      }, {
        text: chrome.i18n.getMessage('copyTitleAndUrl'),
        onClick: function() {
          video.copyTitleAndUrl();
        }.bind(this)
      }, {
        text: chrome.i18n.getMessage('watchOnYouTube'),
        onClick: function() {
          player.watchInTab(video);
        }.bind(this)
      }]
    });
  }
});

export default VideoActions;