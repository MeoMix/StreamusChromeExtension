define(function(require) {
  'use strict';

  var VideoCommand = require('common/enum/videoCommand');
  var VideoRequest = require('common/enum/videoRequest');
  var PlayerState = require('common/enum/playerState');

  var VideoStreamView = Marionette.ItemView.extend({
    el: '.video-stream',
    template: false,

    events: {
      'loadstart': '_onLoadStart',
      'playing': '_onPlaying',
      'pause': '_onPause',
      'seeking': '_onSeeking',
      'seeked': '_onSeeked',
      'timeupdate': '_onTimeUpdate'
    },

    modelEvents: {
      'change:currentTime': '_onChangeCurrentTime'
    },

    lastPostedCurrentTime: null,

    initialize: function() {
      this.listenTo(Application.port, 'receive:message', this._onPortReceiveMessage);
      this._requestInitialState();
    },

    _onLoadStart: function() {
      this.model.resetCurrentTime();
    },

    // TODO: Buffering, Ended, Unstarted, maybe SongCued.
    _onPlaying: function() {
      Application.port.postMessage({
        videoState: PlayerState.Playing
      });
    },

    _onPause: function() {
      Application.port.postMessage({
        videoState: PlayerState.Paused
      });
    },

    _onSeeking: function() {
      Application.port.postMessage({
        videoSeeking: true
      });
    },

    _onSeeked: function() {
      Application.port.postMessage({
        videoSeeking: false
      });
    },

    _onTimeUpdate: function() {
      // Round currentTime to the nearest second to prevent flooding the port with unnecessary messages.
      var currentTime = Math.floor(this.el.currentTime);
      this.model.set('currentTime', currentTime);
    },

    _onChangeCurrentTime: function(model, currentTime) {
      Application.port.postMessage({
        videoCurrentTime: currentTime
      });
    },

    _onPortReceiveMessage: function(message) {
      if (!_.isUndefined(message.initialState)) {
        this._setInitialState(message.initialState);
      }

      if (!_.isUndefined(message.videoCommand)) {
        this._handleCommand(message.videoCommand, message.value);
      }
    },

    _setInitialState: function(initialState) {
      this.el.currentTime = initialState.startSeconds;
      // TODO: Change this so that my player works out of 0-1 instead of 0-100.
      this.el.volume = initialState.volume / 100;
      this.el.muted = initialState.muted;

      if (!initialState.playOnActivate) {
        this.el.pause();
      }
    },

    _handleCommand: function(command, value) {
      switch (command) {
        case VideoCommand.Play:
          this.el.play();
          break;
        case VideoCommand.Pause:
          this.el.pause();
          break;
        case VideoCommand.SetVolume:
          // TODO: Change this so that my player works out of 0-1 instead of 0-100.
          this.el.volume = value / 100;
          break;
        case VideoCommand.SetMuted:
          this.el.muted = value;
          break;
        case VideoCommand.SetCurrentTime:
          this.el.currentTime = value;
          break;
        default:
          console.error('Unhandled command:', command);
      }
    },

    _requestInitialState: function() {
      Application.port.postMessage({
        request: VideoRequest.InitialState
      });
    }
  });

  return VideoStreamView;
});