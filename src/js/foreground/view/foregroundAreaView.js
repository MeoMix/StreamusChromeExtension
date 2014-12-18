define([
    'foreground/view/appBar/appBarRegion',
    'foreground/view/contextMenu/contextMenuRegion',
    'foreground/view/leftPane/leftPaneRegion',
    'foreground/view/notification/notificationRegion',
    'foreground/view/playlist/playlistsAreaRegion',
    'foreground/view/prompt/promptRegion',
    'foreground/view/search/searchAreaRegion',
    'foreground/view/stream/streamRegion',
    'text!template/foregroundArea.html'
], function (AppBarRegion, ContextMenuRegion, LeftPaneRegion, NotificationRegion, PlaylistsAreaRegion, PromptRegion, SearchAreaRegion, StreamRegion, ForegroundAreaTemplate) {
    'use strict';

    var ForegroundAreaView = Marionette.LayoutView.extend({
        id: 'foregroundArea',
        className: 'column',
        template: _.template(ForegroundAreaTemplate),
        
        templateHelpers: function () {
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
        
        ui: function () {
            return {
                loadingMessage: '#' + this.id + '-loadingMessage',
                loadingFailedMessage: '#' + this.id + '-loadingFailedMessage',
                reloadLink: '.' + this.id + '-reloadLink',
                loadAttemptMessage: '#' + this.id + '-loadAttemptMessage'
            };
        },

        regions: function () {
            return {
                appBarRegion: {
                    el: '#' + this.id + '-appBarRegion',
                    regionClass: AppBarRegion
                },
                promptRegion: {
                    el: '#' + this.id + '-promptRegion',
                    regionClass: PromptRegion
                },
                notificationRegion: {
                    el: '#' + this.id + '-notificationRegion',
                    regionClass: NotificationRegion
                },
                contextMenuRegion: {
                    el: '#' + this.id + '-contextMenuRegion',
                    regionClass: ContextMenuRegion
                },
                leftPaneRegion: {
                    el: '#' + this.id + '-leftPaneRegion',
                    regionClass: LeftPaneRegion
                },
                searchAreaRegion: {
                    el: '#' + this.id + '-searchAreaRegion',
                    regionClass: SearchAreaRegion
                },
                playlistsAreaRegion: {
                    el: '#' + this.id + '-playlistsAreaRegion',
                    regionClass: PlaylistsAreaRegion
                },
                streamRegion: {
                    el: '#' + this.id + '-streamRegion',
                    regionClass: StreamRegion
                }
            };
        },
        
        player: null,
        settings: null,

        initialize: function () {
            this.player = Streamus.backgroundPage.player;
            this.settings = Streamus.backgroundPage.settings;

            this.listenTo(this.settings, 'change:showTooltips', this._onSettingsChangeShowTooltips);
            this.listenTo(this.player, 'change:loading', this._onPlayerChangeLoading);
            this.listenTo(this.player, 'change:currentLoadAttempt', this._onPlayerChangeCurrentLoadAttempt);
            window.onunload = this._onWindowUnload.bind(this);
            window.onresize = this._onWindowResize.bind(this);
            window.onerror = this._onWindowError.bind(this);
        },
        
        onRender: function() {
            this._setHideTooltipsClass(this.settings.get('showTooltips'));
            this._checkPlayerLoading();
        },
        
        onShow: function () {
            Streamus.channels.foregroundArea.vent.trigger('shown');
        },

        //  Announce the jQuery target of element clicked so multi-select collections can decide if they should de-select their child views
        _onClick: function (event) {
            Streamus.channels.element.vent.trigger('click', event);
        },

        _onContextMenu: function (event) {
            Streamus.channels.element.vent.trigger('contextMenu', event);
        },

        _onMouseDown: function () {
            Streamus.channels.element.vent.trigger('mouseDown', event);
        },

        _onClickReloadLink: function () {
            chrome.runtime.reload();
        },
        
        _onWindowResize: function () {
            Streamus.channels.window.vent.trigger('resize', {
                height: this.$el.height(),
                width: this.$el.width()
            });
        },

        //  Destroy the foreground to perform memory management / unbind event listeners. Memory leaks will be introduced if this doesn't happen.
        _onWindowUnload: function () {
            Streamus.channels.foreground.vent.trigger('beginUnload');
            Streamus.backgroundChannels.foreground.vent.trigger('beginUnload');
            this.destroy();
            Streamus.channels.foreground.vent.trigger('endUnload');
            Streamus.backgroundChannels.foreground.vent.trigger('endUnload');
        },

        _onWindowError: function (message, url, lineNumber, columnNumber, error) {
            Streamus.backgroundChannels.error.vent.trigger('windowError', message, url, lineNumber, columnNumber, error);
        },

        _onSettingsChangeShowTooltips: function (model, showTooltips) {
            this._setHideTooltipsClass(showTooltips);
        },

        _onPlayerChangeLoading: function (model, loading) {
            loading ? this._startLoading() : this._stopLoading();
        },

        _onPlayerChangeCurrentLoadAttempt: function () {
            this.ui.loadAttemptMessage.text(this._getLoadAttemptMessage());
        },
        
        //  Use some CSS to hide tooltips instead of trying to unbind/rebind all the event handlers.
        _setHideTooltipsClass: function (showTooltips) {
            //  TODO: prefer this to be this.$el, but I need to be able to tell qtip to use foregroundArea as its container.
            $('body').toggleClass('is-hidingTooltips', !showTooltips);
        },

        _startLoading: function () {
           // this.$el.addClass('is-showingSpinner');
            this.ui.loadingFailedMessage.addClass('hidden');
            //this.ui.loadingMessage.removeClass('hidden');
        },
        
        //  Set the foreground's view state to indicate that user interactions are OK once the player is ready.
        _stopLoading: function () {
            this.ui.loadingMessage.addClass('hidden');

            if (this.player.get('ready')) {
                this.$el.removeClass('is-showingSpinner');
                this.ui.loadingFailedMessage.addClass('hidden');
            } else {
                this.ui.loadingFailedMessage.removeClass('hidden');
            }
        },

        _checkPlayerLoading: function () {
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