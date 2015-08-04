define(function(require) {
  'use strict';

  var Video = require('background/model/video');
  var Playlist = require('background/model/playlist');
  var PlaylistItem = require('background/model/playlistItem');
  var SearchResult = require('background/model/searchResult');
  var Player = require('background/model/player');
  var Stream = require('background/model/stream');
  var SignInManager = require('background/model/signInManager');
  var YouTubePlayer = require('background/model/youTubePlayer');
  var ActivePlaylistManager = require('background/model/activePlaylistManager');
  var ShuffleButton = require('background/model/shuffleButton');
  var RepeatButton = require('background/model/repeatButton');
  var RadioButton = require('background/model/radioButton');

  var TestUtility = {
    videoIdLength: 7,
    guidIdLength: 16,

    getGuid: function() {
      return this._getUniqueId(this.guidIdLength);
    },

    _getUniqueId: function(idLength) {
      var text = '';
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

      for (var i = 0; i < idLength; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }

      return text;
    },

    getVideoArray: function(length) {
      var videoArray = [];

      for (var i = 0; i < length; i++) {
        videoArray.push(this.buildVideo(this._getUniqueId(this.videoIdLength)));
      }

      return videoArray;
    },

    getRawVideo: function(idOverride) {
      var id = _.isUndefined(idOverride) ? 'M7lc1UVf-VE' : idOverride;

      return {
        id: id,
        title: 'YouTube Developers Live: Embedded Web Player Customization',
        author: 'Google Developers',
        duration: 1344
      };
    },

    // Construct a basic Video object fit for general testing.
    buildVideo: function(idOverride) {
      return new Video(this.getRawVideo(idOverride));
    },

    // Construct a basic PlaylistItem object fit for general testing.
    buildPlaylistItem: function() {
      return new PlaylistItem({
        video: this.buildVideo()
      });
    },

    buildSearchResult: function() {
      return new SearchResult({
        video: this.buildVideo()
      });
    },

    buildPlaylist: function() {
      return new Playlist({
        title: 'Playlist'
      });
    },

    buildPlayer: function() {
      var player = new Player({
        youTubePlayer: new YouTubePlayer()
      });

      return player;
    },

    buildStream: function() {
      var stream = new Stream({
        player: this.buildPlayer(),
        activePlaylistManager: new ActivePlaylistManager({
          signInManager: new SignInManager()
        }),
        shuffleButton: new ShuffleButton(),
        radioButton: new RadioButton(),
        repeatButton: new RepeatButton()
      });

      return stream;
    }
  };

  return TestUtility;
});