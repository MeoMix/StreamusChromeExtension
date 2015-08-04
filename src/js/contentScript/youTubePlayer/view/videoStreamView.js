define(function(require) {
  'use strict';

  var PlayerState = require('common/enum/playerState');
  var YouTubePlayerState = require('common/enum/youTubePlayerState');

  var VideoStreamView = Marionette.LayoutView.extend({
    el: '.video-stream',
    template: false,

    events: {
      'seeking': '_onSeeking',
      'seeked': '_onSeeked',
      'timeupdate': '_onTimeUpdate',
      'ended': '_onEnded'
    },

    modelEvents: {
      'change:currentTime': '_onChangeCurrentTime',
      'change:volume': '_onChangeVolume',
      'change:muted': '_onChangeMuted'
    },

    initialize: function() {
      this.listenTo(Application.port, 'receive:message', this._onPortReceiveMessage);

      this._onWindowMessage = this._onWindowMessage.bind(this);
      window.addEventListener('message', this._onWindowMessage);
    },

    onBeforeDestroy: function() {
      window.removeEventListener('message', this._onWindowMessage);
    },

    _onSeeking: function() {
      this.model.set('isSeeking', true);
      Application.port.postMessage({
        videoSeeking: true
      });
    },

    _onSeeked: function() {
      this.model.set('isSeeking', false);
      Application.port.postMessage({
        videoSeeking: false
      });
    },

    _onEnded: function() {
      // TODO: Maybe I should just ceil always, but when going into ended it won't round to the last second.
      var currentTime = Math.ceil(this.el.currentTime);
      this.model.set('currentTime', currentTime);
    },

    _onTimeUpdate: function() {
      // Skip updating the time during a 'seeking' event because Streamus UI will not update while player is seeking.
      // If we respond to the initial 'seeking' event then currentTime might not change when seeking completes due to rounding.
      // Guaranteed to get another timeUpdate event once seeking has completed.
      if (!this.model.get('isSeeking')) {
        // TODO: Race condition where currentTime on player.js is set to 0, but video for navigate isn't paused so its time can update.
        // Round currentTime to the nearest second to prevent flooding the port with unnecessary messages.
        var currentTime = Math.floor(this.el.currentTime);
        this.model.set('currentTime', currentTime);
      }
    },

    _onChangeCurrentTime: function(model, currentTime) {
      Application.port.postMessage({
        videoCurrentTime: currentTime
      });
    },

    _onChangeVolume: function(model, volume) {
      Application.port.postMessage({
        volume: volume
      });
    },

    _onChangeMuted: function(model, muted) {
      Application.port.postMessage({
        muted: muted
      });
    },

    _onWindowMessage: function(message) {
      if (!_.isUndefined(message.data.state)) {
        Application.port.postMessage({
          videoState: this._getPlayerState(message.data.state)
        });
      }

      if (!_.isUndefined(message.data.volume)) {
        this.model.set('volume', message.data.volume);
      }

      if (!_.isUndefined(message.data.muted)) {
        this.model.set('muted', message.data.muted);
      }
    },

    _onPortReceiveMessage: function(message) {
      if (message.videoCommand || message.navigate) {
        window.postMessage(message, window.location.origin);
      }
    },

    //  Maps a YouTubePlayerState enumeration value to the corresponding PlayerState enumeration value.
    _getPlayerState: function(youTubePlayerState) {
      var playerState;

      switch (youTubePlayerState) {
        case YouTubePlayerState.Unstarted:
          playerState = PlayerState.Unstarted;
          break;
        case YouTubePlayerState.Ended:
          playerState = PlayerState.Ended;
          break;
        case YouTubePlayerState.Playing:
          playerState = PlayerState.Playing;
          break;
        case YouTubePlayerState.Paused:
          playerState = PlayerState.Paused;
          break;
        case YouTubePlayerState.Buffering:
          playerState = PlayerState.Buffering;
          break;
        case YouTubePlayerState.VideoCued:
          playerState = PlayerState.VideoCued;
          console.error('UNEXPECTED STATE!');
          break;
        default:
          throw new Error('Unmapped YouTubePlayerState:' + youTubePlayerState);
      }

      return playerState;
    }
  });

  return VideoStreamView;
});