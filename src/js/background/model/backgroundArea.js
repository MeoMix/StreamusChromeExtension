define(function (require) {
    'use strict';

    var BrowserSettings = require('background/model/browserSettings');
    var ChromeContextMenusManager = require('background/model/chromeContextMenusManager');
    var ChromeIconManager = require('background/model/chromeIconManager');
    var ChromeNotificationsManager = require('background/model/chromeNotificationsManager');
    var ChromeOmniboxManager = require('background/model/chromeOmniboxManager');
    var ClientErrorManager = require('background/model/clientErrorManager');
    var DataSourceManager = require('background/model/dataSourceManager');
    var DebugManager = require('background/model/debugManager');
    var Player = require('background/model/player');
    var PlaylistsViewModel = require('background/viewModel/playlistsViewModel');
    var Search = require('background/model/search');
    var Settings = require('background/model/settings');
    var SignInManager = require('background/model/signInManager');
    var Stream = require('background/model/stream');
    var TabManager = require('background/model/tabManager');
    var YouTubePlayer = require('background/model/youTubePlayer');
    var NextButton = require('background/model/buttons/nextButton');
    var PlayPauseButton = require('background/model/buttons/playPauseButton');
    var PreviousButton = require('background/model/buttons/previousButton');
    var RadioButton = require('background/model/buttons/radioButton');
    var RepeatButton = require('background/model/buttons/repeatButton');
    var ShuffleButton = require('background/model/buttons/shuffleButton');

    var BackgroundArea = Backbone.Model.extend({
        defaults: {
            youTubePlayer: null,
            debugManager: null,
            foregroundUnloadTimeout: null
        },

        initialize: function () {
            this.listenTo(Streamus.channels.foreground.vent, 'started', this._onForegroundStarted.bind(this));
            this.listenTo(Streamus.channels.foreground.vent, 'beginUnload', this._onForegroundBeginUnload.bind(this));
            this.listenTo(Streamus.channels.foreground.vent, 'endUnload', this._onForegroundEndUnload.bind(this));

            var debugManager = new DebugManager();
            this.set('debugManager', debugManager);
            
            var browserSettings = new BrowserSettings();
            var settings = new Settings();

            var youTubePlayer = new YouTubePlayer();
            this.set('youTubePlayer', youTubePlayer);

            var player = new Player({
                settings: settings,
                youTubePlayer: youTubePlayer,
                debugManager: debugManager
            });
            
            var radioButton = new RadioButton();
            var shuffleButton = new ShuffleButton();
            var repeatButton = new RepeatButton();

            var stream = new Stream({
                player: player,
                shuffleButton: shuffleButton,
                radioButton: radioButton,
                repeatButton: repeatButton
            });

            var tabManager = new TabManager();
            var signInManager = new SignInManager();
            signInManager.signInWithGoogle();

            var search = new Search();

            var chromeContextMenusManager = new ChromeContextMenusManager({
                browserSettings: browserSettings,
                tabManager: tabManager,
                signInManager: signInManager,
                streamItems: stream.get('items')
            });
            
            var chromeIconManager = new ChromeIconManager({
                player: player,
                streamItems: stream.get('items'),
                settings: settings,
                tabManager: tabManager
            });
            
            var chromeNotificationsManager = new ChromeNotificationsManager({
                tabManager: tabManager,
                settings: settings
            });
            
            var chromeOmniboxManager = new ChromeOmniboxManager({
                streamItems: stream.get('items')
            });
            
            var clientErrorManager = new ClientErrorManager({
                signInManager: signInManager
            });

            var nextButton = new NextButton({
                stream: stream,
                radioButton: radioButton,
                shuffleButton: shuffleButton,
                repeatButton: repeatButton
            });

            var playPauseButton = new PlayPauseButton({
                player: player,
                streamItems: stream.get('items')
            });

            var previousButton = new PreviousButton({
                player: player,
                shuffleButton: shuffleButton,
                repeatButton: repeatButton,
                stream: stream
            });

            var dataSourceManager = new DataSourceManager();

            var playlistsViewModel = new PlaylistsViewModel();

            //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
            window.browserSettings = browserSettings;
            window.debugManager = debugManager;
            window.tabManager = tabManager;
            window.signInManager = signInManager;
            window.settings = settings;
            window.stream = stream;
            window.nextButton = nextButton;
            window.playPauseButton = playPauseButton;
            window.previousButton = previousButton;
            window.radioButton = radioButton;
            window.repeatButton = repeatButton;
            window.shuffleButton = shuffleButton;
            window.search = search;
            window.player = player;
            window.dataSourceManager = dataSourceManager;
            window.playlistsViewModel = playlistsViewModel;
        },
        
        _onForegroundStarted: function () {
            if (this.get('foregroundUnloadTimeout') !== null) {
                Streamus.channels.error.commands.trigger('log:error', new Error('Foreground was re-opened before timeout exceeded!'));
            }

            this._clearForegroundUnloadTimeout();
        },
        
        _onForegroundBeginUnload: function() {
            var foregroundUnloadTimeout = setTimeout(this._onForegroundUnloadTimeoutExceeded.bind(this), 500);
            this.set('foregroundUnloadTimeout', foregroundUnloadTimeout);
        },
        
        _onForegroundUnloadTimeoutExceeded: function () {
            Streamus.channels.error.commands.trigger('log:error', new Error('Foreground failed to unload properly!'));
            this._clearForegroundUnloadTimeout();
        },
        
        _onForegroundEndUnload: function () {
            this._clearForegroundUnloadTimeout();
        },
        
        _clearForegroundUnloadTimeout: function() {
            clearTimeout(this.get('foregroundUnloadTimeout'));
            this.set('foregroundUnloadTimeout', null);
        }
    });

    return BackgroundArea;
});