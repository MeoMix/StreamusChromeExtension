define([
    'background/collection/streamItems',
    'background/model/browserSettings',
    'background/model/chromeContextMenusManager',
    'background/model/chromeIconManager',
    'background/model/chromeNotificationsManager',
    'background/model/chromeOmniboxManager',
    'background/model/clientErrorManager',
    'background/model/dataSourceManager',
    'background/model/player',
    'background/model/search',
    'background/model/settings',
    'background/model/signInManager',
    'background/model/syncManager',
    'background/model/tabManager',
    'background/model/youTubePlayer',
    'background/model/buttons/nextButton',
    'background/model/buttons/playPauseButton',
    'background/model/buttons/previousButton',
    'background/model/buttons/radioButton',
    'background/model/buttons/repeatButton',
    'background/model/buttons/shuffleButton'
], function (StreamItems, BrowserSettings, ChromeContextMenusManager, ChromeIconManager, ChromeNotificationsManager, ChromeOmniboxManager, ClientErrorManager, DataSourceManager, Player, Search, Settings, SignInManager, SyncManager, TabManager, YouTubePlayer, NextButton, PlayPauseButton, PreviousButton, RadioButton, RepeatButton, ShuffleButton) {
    'use strict';

    var BackgroundArea = Backbone.Model.extend({
        defaults: {
            youTubePlayer: null,
            search: null,
            streamItems: null,
            signInManager: null,
            foregroundUnloadTimeout: null
        },

        initialize: function () {
            this.listenTo(Streamus.channels.foreground.vent, 'started', this._onForegroundStarted.bind(this));
            this.listenTo(Streamus.channels.foreground.vent, 'beginUnload', this._onForegroundBeginUnload.bind(this));
            this.listenTo(Streamus.channels.foreground.vent, 'endUnload', this._onForegroundEndUnload.bind(this));

            var browserSettings = new BrowserSettings();
            var settings = new Settings();

            var youTubePlayer = new YouTubePlayer();
            this.set('youTubePlayer', youTubePlayer);

            var player = new Player({
                settings: settings,
                youTubePlayer: youTubePlayer
            });
            
            var radioButton = new RadioButton();
            var shuffleButton = new ShuffleButton();
            var repeatButton = new RepeatButton();

            //  TODO: Introduce a Stream object.
            //  TODO: If I don't pass in undefined here then Backbone.LocalStorage doesn't properly load models from storage..
            var streamItems = new StreamItems(undefined, {
                player: player,
                shuffleButton: shuffleButton,
                radioButton: radioButton,
                repeatButton: repeatButton
            });
            this.set('streamItems', streamItems);
            
            var tabManager = new TabManager();
            var signInManager = new SignInManager();
            this.set('signInManager', signInManager);

            var search = new Search();
            this.set('search', search);

            //  TODO: I am initializing these here because I have no better place / concept of how to initialize a bunch of objects with no dependencies.
            var chromeContextMenusManager = new ChromeContextMenusManager({
                browserSettings: browserSettings,
                tabManager: tabManager,
                signInManager: signInManager,
                streamItems: streamItems
            });
            
            var chromeIconManager = new ChromeIconManager({
                player: player
            });
            
            var chromeNotificationsManager = new ChromeNotificationsManager({
                tabManager: tabManager
            });
            
            var chromeOmniboxManager = new ChromeOmniboxManager({
                streamItems: streamItems
            });
            
            var clientErrorManager = new ClientErrorManager();

            var syncManager = new SyncManager();

            var nextButton = new NextButton({
                streamItems: streamItems,
                radioButton: radioButton,
                shuffleButton: shuffleButton,
                repeatButton: repeatButton
            });

            var playPauseButton = new PlayPauseButton({
                player: player,
                streamItems: streamItems
            });

            var previousButton = new PreviousButton({
                player: player,
                shuffleButton: shuffleButton,
                streamItems: streamItems
            });

            var dataSourceManager = new DataSourceManager();

            //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
            //  TODO: Capitalization needs fixing.
            window.BrowserSettings = browserSettings;
            window.TabManager = tabManager;
            window.SignInManager = signInManager;
            window.Settings = settings;
            window.StreamItems = streamItems;
            window.NextButton = nextButton;
            window.PlayPauseButton = playPauseButton;
            window.PreviousButton = previousButton;
            window.RadioButton = radioButton;
            window.RepeatButton = repeatButton;
            window.ShuffleButton = shuffleButton;
            window.Search = search;
            window.Player = player;
            window.DataSourceManager = dataSourceManager;
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

            //  Push all 'heavy' logic which is dependent on the foreground closing to the background and run AFTER views have indicated successful cleanup.
            //  Remember search query for a bit just in case user closes and re-opens immediately.
            var search = this.get('search');
            search.startClearQueryTimer();
            search.get('results').deselectAll();

            var streamItems = this.get('streamItems');
            streamItems.deselectAll();

            var signedInUser = this.get('signInManager').get('signedInUser');
            if (signedInUser !== null) {
                signedInUser.get('playlists').getActivePlaylist().get('items').deselectAll();
            }
        },
        
        _clearForegroundUnloadTimeout: function() {
            clearTimeout(this.get('foregroundUnloadTimeout'));
            this.set('foregroundUnloadTimeout', null);
        }
    });

    return BackgroundArea;
});