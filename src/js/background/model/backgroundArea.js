define(function(require) {
    'use strict';

    var AnalyticsManager = require('background/model/analyticsManager');
    var BrowserSettings = require('background/model/browserSettings');
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
    var YouTubePlayer = require('background/model/youTubePlayer');
    var NextButton = require('background/model/buttons/nextButton');
    var PlayPauseButton = require('background/model/buttons/playPauseButton');
    var PreviousButton = require('background/model/buttons/previousButton');
    var RadioButton = require('background/model/buttons/radioButton');
    var RepeatButton = require('background/model/buttons/repeatButton');
    var ShuffleButton = require('background/model/buttons/shuffleButton');

    var BackgroundArea = Backbone.Model.extend({
        defaults: function() {
            return {
                browserSettings: new BrowserSettings(),
                settings: new Settings(),
                youTubePlayer: new YouTubePlayer(),
                radioButton: new RadioButton(),
                shuffleButton: new ShuffleButton(),
                repeatButton: new RepeatButton(),
                search: new Search(),
                tabManager: new TabManager(),
                signInManager: new SignInManager(),
                analyticsManager: new AnalyticsManager(),
                dataSourceManager: new DataSourceManager(),
                player: null,
                stream: null,
                nextButton: null,
                playPauseButton: null,
                previousButton: null,

                foregroundUnloadTimeout: null
            };
        },

        initialize: function() {
            this.listenTo(Streamus.channels.foreground.vent, 'started', this._onForegroundStarted.bind(this));
            this.listenTo(Streamus.channels.foreground.vent, 'beginUnload', this._onForegroundBeginUnload.bind(this));
            this.listenTo(Streamus.channels.foreground.vent, 'endUnload', this._onForegroundEndUnload.bind(this));
            chrome.runtime.onMessageExternal.addListener(this._onChromeRuntimeMessageExternal.bind(this));

            var player = new Player({
                settings: this.get('settings'),
                youTubePlayer: this.get('youTubePlayer')
            });
            this.set('player', player);

            var stream = new Stream({
                player: player,
                shuffleButton: this.get('shuffleButton'),
                radioButton: this.get('radioButton'),
                repeatButton: this.get('repeatButton')
            });
            this.set('stream', stream);

            //  TODO: Do this via an event instead.
            this.get('signInManager').signInWithGoogle();

            var chromeContextMenusManager = new ChromeContextMenusManager({
                browserSettings: this.get('browserSettings'),
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

            var clientErrorManager = new ClientErrorManager({
                signInManager: this.get('signInManager')
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

            this._exposeProperties();
        },

        _onForegroundStarted: function() {
            if (this.get('foregroundUnloadTimeout') !== null) {
                Streamus.channels.error.commands.trigger('log:error', new Error('Foreground was re-opened before timeout exceeded!'));
            }

            this._clearForegroundUnloadTimeout();
        },

        _onForegroundBeginUnload: function() {
            var foregroundUnloadTimeout = setTimeout(this._onForegroundUnloadTimeoutExceeded.bind(this), 500);
            this.set('foregroundUnloadTimeout', foregroundUnloadTimeout);
        },

        _onForegroundUnloadTimeoutExceeded: function() {
            Streamus.channels.error.commands.trigger('log:error', new Error('Foreground failed to unload properly!'));
            this._clearForegroundUnloadTimeout();
        },

        _onForegroundEndUnload: function() {
            this._clearForegroundUnloadTimeout();
        },

        //  Allow external websites to ping the extension to find out whether the extension is installed or not
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
        },

        _exposeProperties: function() {
            //  TODO: Can I do this dynamically instead of explicitly?
            //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
            window.analyticsManager = this.get('analyticsManager');
            window.browserSettings = this.get('browserSettings');
            window.tabManager = this.get('tabManager');
            window.signInManager = this.get('signInManager');
            window.settings = this.get('settings');
            window.stream = this.get('stream');
            window.nextButton = this.get('nextButton');
            window.playPauseButton = this.get('playPauseButton');
            window.previousButton = this.get('previousButton');
            window.radioButton = this.get('radioButton');
            window.repeatButton = this.get('repeatButton');
            window.shuffleButton = this.get('shuffleButton');
            window.search = this.get('search');
            window.player = this.get('player');
            window.dataSourceManager = this.get('dataSourceManager');
        }
    });

    return BackgroundArea;
});