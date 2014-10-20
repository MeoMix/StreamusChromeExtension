define([
    'foreground/view/contextMenu/contextMenuRegion',
    'foreground/view/leftPane/leftPaneRegion',
    'foreground/view/notification/notificationRegion',
    'foreground/view/playlist/playlistsAreaRegion',
    'foreground/view/prompt/promptRegion',
    'foreground/view/rightPane/rightPaneRegion',
    'foreground/view/search/searchAreaRegion',
    'text!template/foregroundArea.html'
], function (ContextMenuRegion, LeftPaneRegion, NotificationRegion, PlaylistsAreaRegion, PromptRegion, RightPaneRegion, SearchAreaRegion, ForegroundAreaTemplate) {
    'use strict';

    var ForegroundAreaView = Backbone.Marionette.LayoutView.extend({
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
            //  TODO: I think it might make more sense to use mousedown instead of click because dragging elements doesn't hide the contextmenu
            'click': '_onClick',
            'contextmenu': '_onClick',
            'click @ui.reloadLink': '_onClickReloadLink'
        },
        
        ui: {
            loadingMessage: '#foregroundArea-loadingMessage',
            loadingFailedMessage: '#foregroundArea-loadingFailedMessage',
            reloadLink: '.foregroundArea-reloadLink',
            loadAttemptMessage: '#foregroundArea-loadAttemptMessage'
        },

        regions: {
            promptRegion: PromptRegion,
            notificationRegion: NotificationRegion,
            contextMenuRegion: ContextMenuRegion,
            leftPaneRegion: LeftPaneRegion,
            searchAreaRegion: SearchAreaRegion,
            playlistsAreaRegion: PlaylistsAreaRegion,
            rightPaneRegion: RightPaneRegion
        },
        
        player: null,
        settings: null,

        initialize: function () {
            this.player = Streamus.backgroundPage.Player;
            this.settings = Streamus.backgroundPage.Settings;

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
        
        //  Use some CSS to hide tooltips instead of trying to unbind/rebind all the event handlers.
        _setHideTooltipsClass: function (showTooltips) {
            this.$el.toggleClass('is-hidingTooltips', !showTooltips);
        },

        _startLoading: function () {
            this.$el.addClass('is-showingSpinner');
            this.ui.loadingFailedMessage.addClass('hidden');
            this.ui.loadingMessage.removeClass('hidden');
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
        
        _onClick: function(event) {
            this.contextMenuRegion.handleClickEvent(event);
            this._announceClickedElement(event);
        },
        
        //  Announce the jQuery target of element clicked so multi-select collections can decide if they should de-select their child views
        //  and so that menus can close if they weren't clicked.
        _announceClickedElement: function (event) {
            Streamus.channels.global.vent.trigger('clickedElement', $(event.target));
        },
        
        _onWindowResize: function() {
            Streamus.channels.window.vent.trigger('resize', {
                height: this.$el.height(),
                width: this.$el.width()
            });
        },
        
        //  Destroy the foreground to perform memory management / unbind event listeners. Memory leaks will be introduced if this doesn't happen.
        _onWindowUnload: function () {
            this.destroy();
        },
        
        _onWindowError: function (message, url, lineNumber, columnNumber, error) {
            Streamus.backgroundChannels.error.vent.trigger('onWindowError', message, url, lineNumber, columnNumber, error);
        },
        
        _onSettingsChangeShowTooltips: function(model, showTooltips) {
            this._setHideTooltipsClass(showTooltips);
        },
        
        _onClickReloadLink: function() {
            chrome.runtime.reload();
        },
        
        _onPlayerChangeLoading: function (model, loading) {
            loading ? this._startLoading() : this._stopLoading();
        },
        
        _onPlayerChangeCurrentLoadAttempt: function () {
            this.ui.loadAttemptMessage.text(this._getLoadAttemptMessage());
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