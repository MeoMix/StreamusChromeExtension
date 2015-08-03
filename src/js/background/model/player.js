define(function(require) {
  'use strict';

  var ChromeCommand = require('background/enum/chromeCommand');
  var PlayerState = require('common/enum/playerState');

  var Player = Backbone.Model.extend({
    localStorage: new Backbone.LocalStorage('Player'),

    defaults: function() {
      return {
        // Need to set the ID for Backbone.LocalStorage
        id: 'Player',
        // Returns the elapsed time of the currently loaded video. Returns 0 if no video is playing
        currentTime: 0,
        previousState: PlayerState.Unstarted,
        state: PlayerState.Unstarted,
        seeking: false,
        cueing: false,
        // Default volume to 50 to ensure sound is audible but not blasting.
        volume: 50,
        // Muted will be changed by YouTube's API if the API loads properly.
        muted: false,
        loadedVideo: null,
        videoExpirationTime: 0,
        youTubePlayerPort: null,
        youTubePlayer: null
      };
    },

    // Don't want to save everything to localStorage -- only variables which need to be persisted.
    whitelist: ['muted', 'volume'],
    toJSON: function() {
      return this.pick(this.whitelist);
    },

    // Initialize the player by creating a YouTube Player IFrame hosting an HTML5 player
    initialize: function() {
      this.on('change:volume', this._onChangeVolume);
      this.on('change:muted', this._onChangeMuted);
      this.on('change:loadedVideo', this._onChangeLoadedVideo);

      this.listenTo(StreamusBG.channels.player.commands, 'playOnActivate', this._playOnActivate);

      chrome.runtime.onConnect.addListener(this._onChromeRuntimeConnect.bind(this));
      chrome.commands.onCommand.addListener(this._onChromeCommandsCommand.bind(this));

      // Load from Backbone.LocalStorage
      this.fetch();
    },

    activateVideo: function(video, timeInSeconds) {
      var playOnActivate = this.get('playOnActivate') || this.isPausable();
      var startTime = timeInSeconds || 0;

      var videoOptions = {
        videoId: video.get('id'),
        startTime: startTime,
        volume: this.get('volume'),
        playOnActivate: playOnActivate,
        muted: this.get('muted')
      };

      if (!playOnActivate) {
        this.set('cueing', true);
      }

      this.get('youTubePlayer').loadVideo(videoOptions);

      this.set({
        loadedVideo: video,
        // It's helpful to keep currentTime set here because the progress bar in foreground might be visually set,
        // but until the video actually loads -- current time isn't set.
        currentTime: startTime,
        playOnActivate: false
      });
    },

    toggleState: function() {
      var state = this.get('state');
      var playing = state === PlayerState.Playing || state === PlayerState.Buffering;

      if (playing) {
        this.pause();
      } else {
        var isVideoExpired = this._getIsVideoExpired();

        if (isVideoExpired) {
          this.set('playOnActivate', true);
          this.refresh();
        } else {
          this.play();
        }
      }
    },

    setVolume: function(volume) {
      var maxVolume = 100;
      var minVolume = 0;

      if (volume > maxVolume) {
        volume = maxVolume;
      } else if (volume < minVolume) {
        volume = minVolume;
      }

      this.save({
        muted: false,
        volume: volume
      });
    },

    stop: function() {
      this.get('youTubePlayer').stop();

      this.set({
        loadedVideo: null,
        currentTime: 0,
        state: PlayerState.Unstarted
      });
    },

    pause: function() {
      this.get('youTubePlayer').pause();
    },

    play: function() {
      var videoOptions = {
        videoId: this.get('loadedVideo').get('id'),
        startTime: this.get('currentTime'),
        volume: this.get('volume'),
        playOnActivate: true,
        muted: this.get('muted')
      };

      this.get('youTubePlayer').play(videoOptions);
    },

    seekTo: function(timeInSeconds) {
      this.set('currentTime', timeInSeconds);
      this.get('youTubePlayer').setCurrentTime(timeInSeconds);
    },

    watchInTab: function(video) {
      var url = video.get('url');

      if (this.get('loadedVideo') === video) {
        url += '?t=' + this.get('currentTime') + 's';
      }

      chrome.tabs.create({
        url: url
      });

      this.pause();
    },

    refresh: function() {
      var loadedVideo = this.get('loadedVideo');
      if (!_.isNull(loadedVideo)) {
        this.activateVideo(loadedVideo, this.get('currentTime'));
      }

      this._setVideoExpirationTime(loadedVideo);
    },

    isPausable: function() {
      var state = this.get('state');
      // If the player is playing then it's obvious that it can be paused.
      var isPausable = state === PlayerState.Playing;

      // However, if the player is buffering, then it's not so simple. The player might be buffering and paused/unstarted.
      if (state === PlayerState.Buffering) {
        var previousState = this.get('previousState');

        // When seeking it's even more complicated. The seek might result in the player beginning playback, or remaining paused.
        var wasPlaying = previousState === PlayerState.Playing || previousState === PlayerState.Buffering;

        if (this.get('seeking') && !wasPlaying) {
          isPausable = false;
        } else {
          // Don't flicker the buffering indicator if the player is cueing a video.
          isPausable = !this.get('cueing');
        }
      }

      return isPausable;
    },

    // Update the volume whenever the UI modifies the volume property.
    _onChangeVolume: function(model, volume) {
      this.get('youTubePlayer').setVolume(volume);
    },

    _onChangeMuted: function(model, muted) {
      var youTubePlayer = this.get('youTubePlayer');

      if (muted) {
        youTubePlayer.mute();
      } else {
        youTubePlayer.unMute();
      }
    },

    _onChangeLoadedVideo: function(model, loadedVideo) {
      this._setVideoExpirationTime(loadedVideo);
    },

    _onChromeRuntimeConnect: function(port) {
      if (port.name === 'youTubePlayer') {
        this.set('youTubePlayerPort', port);
        port.onMessage.addListener(this._onYouTubePlayerPortMessage.bind(this));
      }
    },

    _onYouTubePlayerPortMessage: function(message) {
      if (!_.isUndefined(message.videoState)) {
        this._updateState(message.videoState);
      }

      if (!_.isUndefined(message.videoCurrentTime)) {
        this.set('currentTime', message.videoCurrentTime);
      }

      if (!_.isUndefined(message.videoSeeking)) {
        this.set('seeking', message.videoSeeking);
      }

      if (!_.isUndefined(message.volume)) {
        this.set('volume', message.volume);
      }

      if (!_.isUndefined(message.muted)) {
        this.set('muted', message.muted);
      }
    },

    _onChromeCommandsCommand: function(command) {
      if (command === ChromeCommand.IncreaseVolume) {
        var increasedVolume = this.get('volume') + 5;
        this.setVolume(increasedVolume);
      } else if (command === ChromeCommand.DecreaseVolume) {
        var decreasedVolume = this.get('volume') - 5;
        this.setVolume(decreasedVolume);
      }
    },

    _playOnActivate: function(playOnActivate) {
      this.set('playOnActivate', playOnActivate);
    },

    // YouTube videos can't be loaded forever. The server's cache will become invalid and
    // the video will fail to buffer. To work around this, reload the video when attempting to play it
    // if it has been loaded for an excessive amount of time.
    _getIsVideoExpired: function() {
      var remainingTime = this.get('videoExpirationTime') - performance.now();
      var isVideoExpired = remainingTime <= 0;

      return isVideoExpired;
    },

    // TODO: Move this to popup window potentially.
    // Keep track of when the video was loaded so that if playback is attempted
    // after it has expired then the video can be properly reloaded.
    _setVideoExpirationTime: function(loadedVideo) {
      var fourHoursInMilliseconds = 14400000;
      var videoExpirationTime = _.isNull(loadedVideo) ? 0 : performance.now() + fourHoursInMilliseconds;
      this.set('videoExpirationTime', videoExpirationTime);
    },

    _updateState: function(state) {
      this.set('previousState', this.get('state'));
      this.set('state', state);

      if (this.get('previousState') === PlayerState.Buffering) {
        this.set('cueing', false);
      }
    }
  });

  return Player;
});