define(function(require) {
  'use strict';

  var VideoCommand = require('common/enum/videoCommand');
  var VideoQuality = require('common/enum/videoQuality');
  // TODO: YouTubeVideoQuality?
  var YouTubeQuality = require('background/enum/youTubeQuality');

  var YouTubePlayer = Backbone.Model.extend({
    defaults: function() {
      return {
        youTubePlayerPort: null,
        openWindow: null,
        isExpectingPortConnection: false,
        commandQueue: []
      };
    },

    initialize: function() {
      this._onYouTubePlayerPortMessage = this._onYouTubePlayerPortMessage.bind(this);
      this._onYouTubePlayerPortDisconnect = this._onYouTubePlayerPortDisconnect.bind(this);

      chrome.runtime.onConnect.addListener(this._onChromeRuntimeConnect.bind(this));

      this.listenTo(StreamusBG.settings, 'change:videoQuality', this._onSettingsChangeVideoQuality);
    },

    loadVideo: function(videoOptions) {
      if (this.has('openWindow')) {
        this.get('youTubePlayerPort').postMessage({
          navigate: {
            urlString: this._videoOptionsToUrl(videoOptions)
          }
        });
      } else if (videoOptions.playOnActivate) {
        this._openWindow(videoOptions);
      }
    },

    play: function(videoOptions) {
      // TODO: Maybe a race-condition here for a window which is opening.
      if (this.has('openWindow')) {
        this._sendVideoCommand(VideoCommand.PlayVideo);
      } else {
        this._openWindow(videoOptions);
      }
    },

    pause: function() {
      this._sendVideoCommand(VideoCommand.PauseVideo);
    },

    stop: function() {
      var openWindow = this.get('openWindow');

      if (!_.isNull(openWindow)) {
        chrome.windows.remove(openWindow.id);
      }
    },

    setVolume: function(volume) {
      this._sendVideoCommand(VideoCommand.SetVolume, volume);
    },

    mute: function() {
      this._sendVideoCommand(VideoCommand.Mute);
    },

    unMute: function() {
      this._sendVideoCommand(VideoCommand.UnMute);
    },

    setCurrentTime: function(timeInSeconds) {
      this._sendVideoCommand(VideoCommand.SeekTo, timeInSeconds);
    },

    _sendVideoCommand: function(commandName, value) {
      var youTubePlayerPort = this.get('youTubePlayerPort');
      var command = {
        videoCommand: commandName,
        value: value
      };

      if (!_.isNull(youTubePlayerPort)) {
        youTubePlayerPort.postMessage(command);
      } else {
        if (this.get('isExpectingPortConnection')) {
          this.get('commandQueue').push(command);
        } else {
          console.error('no window exists');
        }
      }
    },

    _onChromeRuntimeConnect: function(port) {
      if (port.name === 'youTubePlayer') {
        this.set('youTubePlayerPort', port);
        this.set('isExpectingPortConnection', false);

        _.each(this.get('commandQueue'), function(command) {
          port.postMessage(command);
        });
        this.get('commandQueue').length = 0;

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
    },

    _onYouTubePlayerPortDisconnect: function(youTubePlayerPort) {
      youTubePlayerPort.onMessage.removeListener(this._onYouTubePlayerPortMessage);
      youTubePlayerPort.onDisconnect.removeListener(this._onYouTubePlayerPortDisconnect);
      this.set('youTubePlayerPort', null);
    },

    // Attempt to set playback quality to videoQuality or highest possible.
    _onSettingsChangeVideoQuality: function(settings, videoQuality) {
      if (this.has('openWindow')) {
        var suggestedQuality = this._getYouTubeQuality(videoQuality);
        this._sendVideoCommand(VideoCommand.SetPlaybackQuality, suggestedQuality);
      }
    },

    _openWindow: function(videoOptions) {
      this.set('isExpectingPortConnection', true);

      chrome.windows.create({
        type: 'popup',
        url: this._videoOptionsToUrl(videoOptions),
        height: 480,
        width: 854
      }, this._onWindowCreated.bind(this));
    },

    // TODO: Can this fail?
    // TODO: I can check createdWindow.type to see if a popup was created instead and notify.
    // TODO: Tab mode?
    _onWindowCreated: function(createdWindow) {
      this.set('openWindow', createdWindow);
    },

    _videoOptionsToUrl: function(videoOptions) {
      var url = 'https://www.youtube.com/watch';

      url += '?v=' + videoOptions.videoId;
      url += '&streamus=true';
      url += '&t=' + videoOptions.startTime + 's';
      url += '&volume=' + videoOptions.volume;
      url += '&muted=' + videoOptions.muted;
      url += '&playOnActivate=' + videoOptions.playOnActivate;

      // The variable is called suggestedQuality because the widget may not have be able to fulfill the request.
      // If it cannot, it will set its quality to the level most near suggested quality.
      var suggestedQuality = this._getYouTubeQuality(StreamusBG.settings.get('videoQuality'));
      url += '&suggestedQuality=' + suggestedQuality;

      return url;
    },

    // Maps a VideoQuality enumeration value to the corresponding YouTubeQuality enumeration value.
    _getYouTubeQuality: function(videoQuality) {
      var youTubeQuality = YouTubeQuality.Default;

      switch (videoQuality) {
        case VideoQuality.Highest:
          youTubeQuality = YouTubeQuality.Highres;
          break;
        case VideoQuality.Auto:
          youTubeQuality = YouTubeQuality.Default;
          break;
        case VideoQuality.Lowest:
          youTubeQuality = YouTubeQuality.Small;
          break;
        default:
          console.error('Unhandled VideoQuality: ', videoQuality);
          break;
      }

      return youTubeQuality;
    }
  });

  return YouTubePlayer;
});