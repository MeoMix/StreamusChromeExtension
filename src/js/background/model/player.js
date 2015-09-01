'use strict';
import {Model} from 'backbone';
import LocalStorage from 'lib/backbone.localStorage';
import ChromeCommand from 'background/enum/chromeCommand';
import PlayerState from 'common/enum/playerState';

var Player = Model.extend({
  localStorage: new LocalStorage('Player'),

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
      this.play();
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
    var minTime = 0;
    var maxTime = this.get('loadedVideo').get('duration');

    if (timeInSeconds > maxTime) {
      timeInSeconds = maxTime;
    } else if (timeInSeconds < minTime) {
      timeInSeconds = minTime;
    }

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
    switch (command) {
      case ChromeCommand.IncreaseVolume:
        var increasedVolume = this.get('volume') + 5;
        this.setVolume(increasedVolume);
        break;
      case ChromeCommand.DecreaseVolume:
        var decreasedVolume = this.get('volume') - 5;
        this.setVolume(decreasedVolume);
        break;
      case ChromeCommand.SeekForward:
        if (this.has('loadedVideo')) {
          this.seekTo(this.get('currentTime') + 5);
        }
        break;
      case ChromeCommand.SeekBackward:
        if (this.has('loadedVideo')) {
          this.seekTo(this.get('currentTime') - 5);
        }
        break;
    }
  },

  _playOnActivate: function(playOnActivate) {
    this.set('playOnActivate', playOnActivate);
  },

  _updateState: function(state) {
    this.set('previousState', this.get('state'));
    this.set('state', state);

    if (this.get('previousState') === PlayerState.Buffering) {
      this.set('cueing', false);
    }
  }
});

export default Player;