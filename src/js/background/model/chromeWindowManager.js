define(function(require) {
  'use strict';

  var VideoCommand = require('common/enum/videoCommand');
  var VideoRequest = require('common/enum/videoRequest');

  var ChromeWindowManager = Backbone.Model.extend({
    defaults: {
      youTubePlayerPort: null,
      openWindow: null,
      videoInitialState: null,
      videoState: null
    },

    initialize: function() {
      this._onYouTubePlayerPortMessage = this._onYouTubePlayerPortMessage.bind(this);
      this._onYouTubePlayerPortDisconnect = this._onYouTubePlayerPortDisconnect.bind(this);

      chrome.runtime.onConnect.addListener(this._onChromeRuntimeConnect.bind(this));
    },

    // TODO: function name
    loadSong: function(videoInitialState) {
      this.set('videoInitialState', videoInitialState);
      var openWindow = this.get('openWindow');

      if (_.isNull(openWindow)) {
        this._openWindow(videoInitialState);
      } else {
        // TODO: Set window's URL to new song.
      }
    },

    play: function() {
      this._sendVideoCommand(VideoCommand.Play);
    },

    pause: function() {
      this._sendVideoCommand(VideoCommand.Pause);
    },

    setVolume: function(volume) {
      this._sendVideoCommand(VideoCommand.SetVolume, volume);
    },

    setMuted: function(muted) {
      this._sendVideoCommand(VideoCommand.SetMuted, muted);
    },

    setCurrentTime: function(timeInSeconds) {
      this._sendVideoCommand(VideoCommand.SetCurrentTime, timeInSeconds);
    },

    _sendVideoCommand: function(commandName, value) {
      var youTubePlayerPort = this.get('youTubePlayerPort');

      if (!_.isNull(youTubePlayerPort)) {
        youTubePlayerPort.postMessage({
          videoCommand: commandName,
          value: value
        });
      } else {
        console.error('No open window exists.');
      }
    },

    _onChromeRuntimeConnect: function(port) {
      if (port.name === 'youTubePlayer') {
        this.set('youTubePlayerPort', port);
        port.onMessage.addListener(this._onYouTubePlayerPortMessage);
        port.onDisconnect.addListener(this._onYouTubePlayerPortDisconnect);
      }
    },

    _onYouTubePlayerPortMessage: function(message) {
      if (!_.isUndefined(message.windowEvent)) {
        switch (message.windowEvent) {
          case 'unload':
            this.set('openWindow', null);
            break;
          default:
            console.error('Unexpected window event:', message.windowEvent);
            break;
        }
      }

      if (!_.isUndefined(message.request)) {
        switch(message.request) {
          case VideoRequest.InitialState:
            this.get('youTubePlayerPort').postMessage({
              initialState: this.get('videoInitialState')
            });
            break;
          default:
            console.error('Unexpected request:', message.request);
            break;
        }
      }

      if (!_.isUndefined(message.videoState)) {
        // TODO: Standardize videoState.
        this.set('videoState', message.videoState);
      }
    },

    _onYouTubePlayerPortDisconnect: function(youTubePlayerPort) {
      youTubePlayerPort.onMessage.removeListener(this._onYouTubePlayerPortMessage);
      youTubePlayerPort.onDisconnect.removeListener(this._onYouTubePlayerPortDisconnect);
      this.set('youTubePlayerPort', null);
    },

    _openWindow: function(videoInitialState) {
      chrome.windows.create({
        type: 'popup',
        url: 'https://www.youtube.com/watch?v=' + videoInitialState.videoId + '&streamus=1'
      }, this._onWindowCreated.bind(this));
    },

    // TODO: Can this fail?
    // TODO: I can check createdWindow.type to see if a popup was created instead and notify.
    // TODO: Tab mode?
    _onWindowCreated: function(createdWindow) {
      this.set('openWindow', createdWindow);
    }
  });

  return ChromeWindowManager;
});