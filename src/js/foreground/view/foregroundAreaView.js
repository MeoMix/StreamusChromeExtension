define(function(require) {
    'use strict';

    var AppBarRegion = require('foreground/view/appBar/appBarRegion');
    var SimpleMenuRegion = require('foreground/view/simpleMenu/simpleMenuRegion');
    var DialogRegion = require('foreground/view/dialog/dialogRegion');
    var SpinnerView = require('foreground/view/element/spinnerView');
    var LeftPaneRegion = require('foreground/view/leftPane/leftPaneRegion');
    var NotificationRegion = require('foreground/view/notification/notificationRegion');
    var PlaylistsAreaRegion = require('foreground/view/playlist/playlistsAreaRegion');
    var SaveSongsRegion = require('foreground/view/saveSongs/saveSongsRegion');
    var SearchRegion = require('foreground/view/search/searchRegion');
    var StreamRegion = require('foreground/view/stream/streamRegion');
    var SelectionBarRegion = require('foreground/view/selectionBar/selectionBarRegion');
    var VideoRegion = require('foreground/view/video/videoRegion');
    var TooltipRegion = require('foreground/view/tooltip/tooltipRegion');
    var KeyCode = require('foreground/enum/keyCode');
    var ForegroundAreaTemplate = require('text!template/foregroundArea.html');

    var ForegroundAreaView = Marionette.LayoutView.extend({
        id: 'foregroundArea',
        el: '#foregroundArea',
        className: 'flexColumn u-fullHeight',
        template: _.template(ForegroundAreaTemplate),

        templateHelpers: function() {
            return {
                loadingYouTubeMessage: chrome.i18n.getMessage('loadingYouTube'),
                loadingYouTubeFailedMessage: chrome.i18n.getMessage('loadingYouTubeFailed'),
                reloadMessage: chrome.i18n.getMessage('reload'),
                loadAttemptMessage: this._getLoadAttemptMessage()
            };
        },

        events: {
            'mousedown': '_onMouseDown',
            'click': '_onClick',
            'contextmenu': '_onContextMenu',
            'click @ui.reloadLink': '_onClickReloadLink'
        },

        ui: {
            loadingMessage: '[data-ui~=loadingMessage]',
            loadingFailedMessage: '[data-ui~=loadingFailedMessage]',
            reloadLink: '[data-ui~=reloadLink]',
            loadAttemptMessage: '[data-ui~=loadAttemptMessage]'
        },

        regions: function() {
            return {
                spinner: '[data-region=spinner]',
                appBar: {
                    selector: '[data-region=appBar]',
                    regionClass: AppBarRegion
                },
                dialog: {
                    selector: '[data-region=dialog]',
                    regionClass: DialogRegion,
                    player: Streamus.backgroundPage.player,
                    signInManager: Streamus.backgroundPage.signInManager
                },
                notification: {
                    selector: '[data-region=notification]',
                    regionClass: NotificationRegion
                },
                simpleMenu: {
                    selector: '[data-region=simpleMenu]',
                    regionClass: SimpleMenuRegion
                },
                leftPane: {
                    selector: '[data-region=leftPane]',
                    regionClass: LeftPaneRegion,
                    settings: Streamus.backgroundPage.settings
                },
                search: {
                    selector: '[data-region=search]',
                    regionClass: SearchRegion,
                    settings: Streamus.backgroundPage.settings
                },
                saveSongs: {
                    selector: '[data-region=saveSongs]',
                    regionClass: SaveSongsRegion,
                    signInManager: Streamus.backgroundPage.signInManager
                },
                playlistsArea: {
                    selector: '[data-region=playlistsArea]',
                    regionClass: PlaylistsAreaRegion,
                    signInManager: Streamus.backgroundPage.signInManager
                },
                stream: {
                    selector: '[data-region=stream]',
                    regionClass: StreamRegion
                },
                selectionBar: {
                    selector: '[data-region=selectionBar]',
                    regionClass: SelectionBarRegion
                },
                video: {
                    selector: '[data-region=video]',
                    regionClass: VideoRegion
                },
                tooltip: {
                    selector: '[data-region=tooltip]',
                    regionClass: TooltipRegion
                }
            };
        },

        player: null,
        settings: null,
        analyticsManager: null,

        playerEvents: {
            'change:loading': '_onPlayerChangeLoading',
            'change:currentLoadAttempt': '_onPlayerChangeCurrentLoadAttempt'
        },

        initialize: function(options) {
            this.player = options.player;
            this.settings = options.settings;
            this.analyticsManager = options.analyticsManager;
            this.bindEntityEvents(this.player, this.playerEvents);

            //  It's important to bind pre-emptively or attempts to call removeEventListener will fail to find the appropriate reference.
            this._onWindowUnload = this._onWindowUnload.bind(this);
            this._onWindowResize = this._onWindowResize.bind(this);
            this._onWindowError = this._onWindowError.bind(this);
            this._onKeyDown = this._onKeyDown.bind(this);

            window.addEventListener('unload', this._onWindowUnload);
            window.addEventListener('resize', this._onWindowResize);
            window.addEventListener('error', this._onWindowError);
            window.addEventListener('keydown', this._onKeyDown);

            this.analyticsManager.sendPageView('/foreground.html');
        },

        onRender: function() {
            this.showChildView('spinner', new SpinnerView());
            this._checkPlayerLoading();

            Streamus.channels.foregroundArea.vent.trigger('rendered');

            //  After announcing that the foregroundArea has rendered successfully, wait a moment for other views to respond.
            //  Then, announce that the foregroundArea is now an 'idle' state to allow for non-critical components to render themselves.
            setTimeout(function() {
                Streamus.channels.foregroundArea.vent.trigger('idle');
            }.bind(this), 250);
        },

        //  Announce the jQuery target of element clicked so multi-select collections can decide if they should de-select their child views
        _onClick: function(event) {
            Streamus.channels.element.vent.trigger('click', event);
        },

        _onContextMenu: function(event) {
            Streamus.channels.element.vent.trigger('contextMenu', event);
        },

        _onMouseDown: function() {
            Streamus.channels.element.vent.trigger('mouseDown', event);
        },

        _onClickReloadLink: function() {
            chrome.runtime.reload();
        },

        _onWindowResize: function() {
            Streamus.channels.window.vent.trigger('resize', {
                height: this.$el.height(),
                width: this.$el.width()
            });
        },

        //  Destroy the foreground to perform memory management / unbind event listeners. Memory leaks will be introduced if this doesn't happen.
        _onWindowUnload: function() {
            Streamus.channels.foreground.vent.trigger('beginUnload');
            Streamus.backgroundChannels.foreground.vent.trigger('beginUnload');
            this.destroy();
            Streamus.channels.foreground.vent.trigger('endUnload');
            Streamus.backgroundChannels.foreground.vent.trigger('endUnload');
        },

        _onWindowError: function(message, url, lineNumber, columnNumber, error) {
            Streamus.backgroundChannels.error.vent.trigger('windowError', message, url, lineNumber, columnNumber, error);
        },

        _onKeyDown: function(event) {
            //  If the user presses space without any child element focused then assume it's an intenentional request to play/pause.
            if (event.keyCode === KeyCode.Space && document.activeElement === document.body) {
                Streamus.channels.playPauseButton.commands.trigger('tryToggle:playerState');
            }
        },

        _onPlayerChangeLoading: function(model, loading) {
            if (loading) {
                this._startLoading();
            } else {
                this._stopLoading();
            }
        },

        _onPlayerChangeCurrentLoadAttempt: function() {
            this.ui.loadAttemptMessage.text(this._getLoadAttemptMessage());
        },

        _startLoading: function() {
            this.$el.addClass('is-showingSpinner');
            this.ui.loadingFailedMessage.addClass('is-hidden');
            this.ui.loadingMessage.removeClass('is-hidden');
        },

        //  Set the foreground's view state to indicate that user interactions are OK once the player is ready.
        _stopLoading: function() {
            this.ui.loadingMessage.addClass('is-hidden');

            if (this.player.get('ready')) {
                this.$el.removeClass('is-showingSpinner');
                this.ui.loadingFailedMessage.addClass('is-hidden');
            } else {
                this.ui.loadingFailedMessage.removeClass('is-hidden');
            }
        },

        _checkPlayerLoading: function() {
            if (this.player.get('loading')) {
                this._startLoading();
            }
        },

        _getLoadAttemptMessage: function() {
            return chrome.i18n.getMessage('loadAttempt', [this.player.get('currentLoadAttempt'), this.player.get('maxLoadAttempts')]);
        }
    });

    return ForegroundAreaView;
});