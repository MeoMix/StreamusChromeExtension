define(function(require) {
  'use strict';

  var ChromeCommand = require('background/enum/chromeCommand');
  var PlayerState = require('common/enum/playerState');
  var YouTubeQuality = require('background/enum/youTubeQuality');
  var SongQuality = require('common/enum/songQuality');

  var Player = Backbone.Model.extend({
    localStorage: new Backbone.LocalStorage('Player'),

    defaults: function() {
      return {
        // Need to set the ID for Backbone.LocalStorage
        id: 'Player',
        // Returns the elapsed time of the currently loaded song. Returns 0 if no song is playing
        currentTime: 0,
        // API will fire a 'ready' event after initialization which indicates the player can now respond accept commands
        // TODO: This isn't true. It should be false and wait for the window to respond that it's ready.
        ready: true,
        loading: false,
        currentLoadAttempt: 1,
        maxLoadAttempts: 10,
        previousState: PlayerState.Unstarted,
        state: PlayerState.Unstarted,
        seeking: false,
        // Default to 50 to ensure sound is audible but not blasting.
        // Volume will be changed by YouTube's API if the API loads properly.
        volume: 50,
        maxVolume: 100,
        minVolume: 0,
        // Muted will be changed by YouTube's API if the API loads properly.
        muted: false,
        loadedSong: null,
        // Keep track of when the song was loaded so that if playback is attempted
        // after it has expired then the song can be properly reloaded.
        initialSongLoadTime: 0,
        // 4 hours in milliseconds. I believe YouTube's cache expires in ~5.5 hours.
        maxSongLoadTime: 14400000,
        songToActivate: null,
        youTubePlayerPort: null,
        cueing: false,
        settings: null,
        youTubePlayer: null,
        chromeWindowManager: null
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
      this.on('change:ready', this._onChangeReady);
      this.on('change:loading', this._onChangeLoading);
      this.on('change:state', this._onChangeState);
      this.on('change:loadedSong', this._onChangeLoadedSong);

      this.listenTo(this.get('settings'), 'change:songQuality', this._onChangeSongQuality);
      //this.listenTo(this.get('youTubePlayer'), 'change:ready', this._onYouTubePlayerChangeReady);
      //this.listenTo(this.get('youTubePlayer'), 'change:state', this._onYouTubePlayerChangeState);
      this.listenTo(this.get('chromeWindowManager'), 'change:state', this._onChromeWindowManagerChangeState);
      //this.listenTo(this.get('youTubePlayer'), 'youTubeError', this._onYouTubePlayerError);
      //this.listenTo(this.get('youTubePlayer'), 'change:loading', this._onYouTubePlayerChangeLoading);
      //this.listenTo(this.get('youTubePlayer'), 'change:currentLoadAttempt', this._onYouTubePlayerChangeCurrentLoadAttempt);
      this.listenTo(StreamusBG.channels.player.commands, 'playOnActivate', this._playOnActivate);

      chrome.runtime.onConnect.addListener(this._onChromeRuntimeConnect.bind(this));
      chrome.commands.onCommand.addListener(this._onChromeCommandsCommand.bind(this));

      this._ensureInitialState();
    },

    activateSong: function(song, timeInSeconds) {
      console.log('song?', song, this.get('ready'));
      if (this.get('ready')) {
        var playOnActivate = this.get('playOnActivate');
        var startSeconds = timeInSeconds || 0;

        var videoOptions = {
          videoId: song.get('id'),
          startSeconds: startSeconds,
          // The variable is called suggestedQuality because the widget may not have be able to fulfill the request.
          // If it cannot, it will set its quality to the level most near suggested quality.
          suggestedQuality: this._getYouTubeQuality(this.get('settings').get('songQuality')),
          volume: this.get('volume'),
          playOnActive: playOnActivate,
          muted: this.get('muted')
        };

        //if (playOnActivate || this.isPausable()) {
        //  this.get('youTubePlayer').loadVideoById(videoOptions);
        //} else {
        //  this.set('cueing', true);
        //  this.get('youTubePlayer').cueVideoById(videoOptions);
        //}
        // TODO: Handle play vs pause.
        console.log('activating');
        this.get('chromeWindowManager').loadSong(videoOptions);

        this.set({
          loadedSong: song,
          // It's helpful to keep currentTime set here because the progress bar in foreground might be visually set,
          // but until the song actually loads -- current time isn't set.
          currentTime: startSeconds,
          playOnActivate: false,
          songToActivate: null
        });
      } else {
        this.set('songToActivate', song);
      }
    },

    toggleState: function() {
      var state = this.get('state');
      var playing = state === PlayerState.Playing || state === PlayerState.Buffering;

      if (playing) {
        this.pause();
      } else {
        var isSongExpired = this._getIsSongExpired();

        if (isSongExpired) {
          this.set('playOnActivate', true);
          this.refresh();
        } else {
          this.play();
        }
      }
    },

    setVolume: function(volume) {
      var maxVolume = this.get('maxVolume');
      var minVolume = this.get('minVolume');

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
        loadedSong: null,
        currentTime: 0,
        state: PlayerState.Unstarted
      });
    },

    pause: function() {
      this.get('chromeWindowManager').pause();
    },

    play: function() {
      //if (this.get('youTubePlayer').get('ready')) {
        this.get('chromeWindowManager').play();
        //this.get('youTubePlayer').play();
      //} else {
      //  this.set('playOnActivate', true);
      //  this.get('youTubePlayer').preload();
      //}
    },

    seekTo: function(timeInSeconds) {
      if (this.get('ready')) {
        // There's an issue in YouTube's API which makes this code necessary.
        // If the user calls seekTo to the end of the song then the player gets put into the 'ended' state.
        // If seekTo is called from the 'ended' state YouTube will play the song rather than keep it paused.
        // If seekTo is called while YouTubePlayer is in SongCued then playback will start which is not desired.
        // Ensure this doesn't happen -- I can't figure out how it's getting into the SongCued state.
        //var youTubePlayer = this.get('youTubePlayer');
        //if (timeInSeconds === this.get('loadedSong').get('duration') || youTubePlayer.get('state') === YouTubePlayerState.SongCued) {
        //  this.activateSong(this.get('loadedSong'), timeInSeconds);
        //} else {
        //  // currentTime won't update until 'play' happens and if refresh is needed while paused then currentTime is wrong
        //  this.set('currentTime', timeInSeconds);

        //  var isSongExpired = this._getIsSongExpired();
        //  if (isSongExpired) {
        //    this.refresh();
        //  }

        //  youTubePlayer.seekTo(timeInSeconds);
        //}
        console.log('seeking to:', timeInSeconds);
        this.get('chromeWindowManager').setCurrentTime(timeInSeconds);
      } else {
        this.set('currentTime', timeInSeconds);
      }
    },

    watchInTab: function(song) {
      var url = song.get('url');

      if (this.get('loadedSong') === song) {
        url += '?t=' + this.get('currentTime') + 's';
      }

      chrome.tabs.create({
        url: url
      });

      this.pause();
    },

    refresh: function() {
      var loadedSong = this.get('loadedSong');
      if (!_.isNull(loadedSong)) {
        this.activateSong(loadedSong, this.get('currentTime'));
      }

      this._setInitialSongLoadTime(loadedSong);
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
          // Don't flicker the buffering indicator if the player is cueing a song.
          isPausable = !this.get('cueing');
        }
      }

      return isPausable;
    },

    // Ensure that the initial state of the player properly reflects the state of its APIs
    _ensureInitialState: function() {
      //this.set('ready', this.get('youTubePlayer').get('ready'));
      //this.set('loading', this.get('youTubePlayer').get('loading'));
      //this.set('currentLoadAttempt', this.get('youTubePlayer').get('currentLoadAttempt'));
    },

    // Attempt to set playback quality to songQuality or highest possible.
    _onChangeSongQuality: function(model, songQuality) {
      var youTubeQuality = this._getYouTubeQuality(songQuality);
      this.get('youTubePlayer').setPlaybackQuality(youTubeQuality);
    },

    // Update the volume whenever the UI modifies the volume property.
    _onChangeVolume: function(model, volume) {
      if (this.get('ready')) {
        this.get('chromeWindowManager').setVolume(volume);
      } else {
        //this.get('youTubePlayer').preload();
      }
    },

    _onChangeMuted: function(model, muted) {
      if (this.get('ready')) {
        this.get('chromeWindowManager').setMuted(muted);
      } else {
        //this.get('youTubePlayer').preload();
      }
    },

    _onChangeReady: function(model, ready) {
      if (ready) {
        // Load from Backbone.LocalStorage
        this.fetch();

        // If an 'activateSong' command came in while the player was not ready, fulfill it now.
        var songToActivate = this.get('songToActivate');
        if (!_.isNull(songToActivate)) {
          this.activateSong(songToActivate);
        } else {
          // Otherwise, ensure that the currently active song is loaded into its respective API player.
          this.refresh();
        }
      }
    },

    _onChangeLoading: function(model, loading) {
      // Ensure player doesn't start playing a song when recovering from a bad state after a long period of time.
      // It is OK to start playback again when recovering initially, but not OK if recovering hours later.
      if (!loading && !this.get('ready')) {
        var loadedSong = this.get('loadedSong');
        var state = _.isNull(loadedSong) ? PlayerState.Unstarted : PlayerState.Paused;
        this.set('state', state);
      }
    },

    _onChangeLoadedSong: function(model, loadedSong) {
      this._setInitialSongLoadTime(loadedSong);
    },

    _onChromeRuntimeConnect: function(port) {
      if (port.name === 'youTubePlayer') {
        this.set('youTubePlayerPort', port);
        port.onMessage.addListener(this._onYouTubePlayerPortMessage.bind(this));
      }
    },

    _onYouTubePlayerPortMessage: function(message) {
      if (!_.isUndefined(message.videoState)) {
        this.set('state', message.videoState);
      }

      if (!_.isUndefined(message.videoCurrentTime)) {
        this.set({
          currentTime: message.videoCurrentTime
        });
      }

      //if (!_.isUndefined(message.error)) {
      //  var error = new Error(message.error);
      //  StreamusBG.channels.error.commands.trigger('log:error', error);
      //}

      if (!_.isUndefined(message.videoSeeking)) {
        this.set('seeking', message.videoSeeking);
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

    _onYouTubePlayerChangeReady: function(model, ready) {
      this.set('ready', ready);
    },

    _onChromeWindowManagerChangeState: function(chromeWindowManager, playerState) {
      this.set('previousState', this.get('state'));
      this.set('state', playerState);

      if (this.get('previousState') === PlayerState.Buffering) {
        this.set('cueing', false);
      }
    },

    _onYouTubePlayerChangeLoading: function(model, loading) {
      this.set('loading', loading);
    },

    _onYouTubePlayerChangeCurrentLoadAttempt: function(model, currentLoadAttempt) {
      this.set('currentLoadAttempt', currentLoadAttempt);
    },

    // Emit errors so the foreground so can notify the user.
    _onYouTubePlayerError: function(model, error) {
      this.trigger('youTubeError', this, error);
    },

    _playOnActivate: function(playOnActivate) {
      this.set('playOnActivate', playOnActivate);
    },

    // Maps a SongQuality enumeration value to the corresponding YouTubeQuality enumeration value.
    _getYouTubeQuality: function(songQuality) {
      var youTubeQuality = YouTubeQuality.Default;

      switch (songQuality) {
        case SongQuality.Highest:
          youTubeQuality = YouTubeQuality.Highres;
          break;
        case SongQuality.Auto:
          youTubeQuality = YouTubeQuality.Default;
          break;
        case SongQuality.Lowest:
          youTubeQuality = YouTubeQuality.Small;
          break;
        default:
          console.error('Unhandled SongQuality: ', songQuality);
          break;
      }

      return youTubeQuality;
    },

    // YouTube videos can't be loaded forever. The server's cache will become invalid and
    // the video will fail to buffer. To work around this, reload the video when attempting to play it
    // if it has been loaded for an excessive amount of time.
    _getIsSongExpired: function() {
      var songLoadTime = performance.now() - this.get('initialSongLoadTime');
      var isSongExpired = songLoadTime > this.get('maxSongLoadTime');

      return isSongExpired;
    },

    _setInitialSongLoadTime: function(loadedSong) {
      var initialSongLoadTime = _.isNull(loadedSong) ? 0 : performance.now();
      this.set('initialSongLoadTime', initialSongLoadTime);
    }
  });

  return Player;
});