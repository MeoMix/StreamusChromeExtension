define([
    'background/collection/playlists',
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
], function (Playlists, StreamItems, BrowserSettings, ChromeContextMenusManager, ChromeIconManager, ChromeNotificationsManager, ChromeOmniboxManager, ClientErrorManager, DataSourceManager, Player, Search, Settings, SignInManager, SyncManager, TabManager, YouTubePlayer, NextButton, PlayPauseButton, PreviousButton, RadioButton, RepeatButton, ShuffleButton) {
    'use strict';

    var BackgroundArea = Backbone.Model.extend({
        defaults: {
            youTubePlayer: null
        },

        initialize: function () {
            var browserSettings = new BrowserSettings();
            var settings = new Settings();

            var playlists = new Playlists();
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
            
            var tabManager = new TabManager();
            var signInManager = new SignInManager({
                playlists: playlists
            });
            var search = new Search();

            //  TODO: I am initializing these here because I have no better place / concept of how to initialize a bunch of objects with no dependencies.
            var chromeContextMenusManager = new ChromeContextMenusManager({
                browserSettings: browserSettings,
                tabManager: tabManager,
                signInManager: signInManager,
                playlists: playlists
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
            window.Playlists = playlists;
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
        }
    });

    return BackgroundArea;
});