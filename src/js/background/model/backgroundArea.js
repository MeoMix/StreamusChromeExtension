define(function(require) {
  'use strict';

  var AnalyticsManager = require('background/model/analyticsManager');
  var ChromeContextMenusManager = require('background/model/chromeContextMenusManager');
  var ChromeIconManager = require('background/model/chromeIconManager');
  var ChromeNotificationsManager = require('background/model/chromeNotificationsManager');
  var ChromeOmniboxManager = require('background/model/chromeOmniboxManager');
  var ClientErrorManager = require('background/model/clientErrorManager');
  var DataSourceManager = require('background/model/dataSourceManager');
  var Player = require('background/model/player');
  var Search = require('background/model/search');
  var Settings = require('background/model/settings');
  var SignInManager = require('background/model/signInManager');
  var Stream = require('background/model/stream');
  var TabManager = require('background/model/tabManager');
  var NextButton = require('background/model/nextButton');
  var PlayPauseButton = require('background/model/playPauseButton');
  var PreviousButton = require('background/model/previousButton');
  var RadioButton = require('background/model/radioButton');
  var RepeatButton = require('background/model/repeatButton');
  var ShuffleButton = require('background/model/shuffleButton');
  var VideoButton = require('background/model/videoButton');
  var ActivePlaylistManager = require('background/model/activePlaylistManager');
  var YouTubePlayer = require('background/model/youTubePlayer');

  var BackgroundArea = Backbone.Model.extend({
    defaults: function() {
      return {
        settings: new Settings(),
        radioButton: new RadioButton(),
        shuffleButton: new ShuffleButton(),
        repeatButton: new RepeatButton(),
        videoButton: new VideoButton(),
        search: new Search(),
        tabManager: new TabManager(),
        signInManager: new SignInManager(),
        analyticsManager: new AnalyticsManager(),
        dataSourceManager: new DataSourceManager(),
        activePlaylistManager: null,
        player: null,
        stream: null,
        nextButton: null,
        playPauseButton: null,
        previousButton: null,
        foregroundUnloadTimeout: null
      };
    },

    initialize: function() {
      // Trying out more of a 'datastore' pattern instead of passing data down.
      StreamusBG.settings = this.get('settings');

      this.listenTo(StreamusBG.channels.foreground.vent, 'started', this._onForegroundStarted.bind(this));
      this.listenTo(StreamusBG.channels.foreground.vent, 'beginUnload', this._onForegroundBeginUnload.bind(this));
      this.listenTo(StreamusBG.channels.foreground.vent, 'endUnload', this._onForegroundEndUnload.bind(this));
      chrome.runtime.onMessageExternal.addListener(this._onChromeRuntimeMessageExternal.bind(this));

      // It's a good idea to create this as soon as possible so that all commands to log errors can be captured.
      var clientErrorManager = new ClientErrorManager({
        signInManager: this.get('signInManager')
      });

      var youTubePlayer = new YouTubePlayer();

      var player = new Player({
        youTubePlayer: youTubePlayer
      });
      this.set('player', player);

      var stream = new Stream({
        player: player,
        shuffleButton: this.get('shuffleButton'),
        radioButton: this.get('radioButton'),
        repeatButton: this.get('repeatButton')
      });
      this.set('stream', stream);

      var activePlaylistManager = new ActivePlaylistManager({
        signInManager: this.get('signInManager')
      });
      this.set('activePlaylistManager', activePlaylistManager);

      var chromeContextMenusManager = new ChromeContextMenusManager({
        settings: this.get('settings'),
        tabManager: this.get('tabManager'),
        signInManager: this.get('signInManager'),
        streamItems: stream.get('items')
      });

      var chromeIconManager = new ChromeIconManager({
        player: player,
        streamItems: stream.get('items'),
        settings: this.get('settings'),
        tabManager: this.get('tabManager')
      });

      var chromeNotificationsManager = new ChromeNotificationsManager({
        tabManager: this.get('tabManager'),
        settings: this.get('settings')
      });

      var chromeOmniboxManager = new ChromeOmniboxManager({
        streamItems: stream.get('items')
      });

      this.set('nextButton', new NextButton({
        stream: stream,
        radioButton: this.get('radioButton'),
        shuffleButton: this.get('shuffleButton'),
        repeatButton: this.get('repeatButton')
      }));

      this.set('playPauseButton', new PlayPauseButton({
        player: player,
        streamItems: stream.get('items')
      }));

      this.set('previousButton', new PreviousButton({
        player: player,
        shuffleButton: this.get('shuffleButton'),
        repeatButton: this.get('repeatButton'),
        stream: stream
      }));
    },

    getExposedProperties: function() {
      return {
        activePlaylistManager: this.get('activePlaylistManager'),
        analyticsManager: this.get('analyticsManager'),
        dataSourceManager: this.get('dataSourceManager'),
        nextButton: this.get('nextButton'),
        playPauseButton: this.get('playPauseButton'),
        previousButton: this.get('previousButton'),
        radioButton: this.get('radioButton'),
        repeatButton: this.get('repeatButton'),
        settings: this.get('settings'),
        signInManager: this.get('signInManager'),
        stream: this.get('stream'),
        shuffleButton: this.get('shuffleButton'),
        search: this.get('search'),
        tabManager: this.get('tabManager'),
        player: this.get('player'),
        videoButton: this.get('videoButton')
      };
    },

    _onForegroundStarted: function() {
      if (this.has('foregroundUnloadTimeout')) {
        StreamusBG.channels.error.commands.trigger('log:error', new Error('Foreground was re-opened before timeout exceeded!'));
      }

      this._clearForegroundUnloadTimeout();
    },

    _onForegroundBeginUnload: function() {
      var foregroundUnloadTimeout = setTimeout(this._onForegroundUnloadTimeoutExceeded.bind(this), 500);
      this.set('foregroundUnloadTimeout', foregroundUnloadTimeout);
    },

    _onForegroundUnloadTimeoutExceeded: function() {
      StreamusBG.channels.error.commands.trigger('log:error', new Error('Foreground failed to unload properly!'));
      this._clearForegroundUnloadTimeout();
    },

    _onForegroundEndUnload: function() {
      this._clearForegroundUnloadTimeout();
    },

    // Allow external websites to ping the extension to find out whether the extension is installed or not
    _onChromeRuntimeMessageExternal: function(request, sender, sendResponse) {
      if (request.message === 'isInstalled') {
        sendResponse({
          isInstalled: true
        });
      }
    },

    _clearForegroundUnloadTimeout: function() {
      clearTimeout(this.get('foregroundUnloadTimeout'));
      this.set('foregroundUnloadTimeout', null);
    }
  });

  return BackgroundArea;
});
