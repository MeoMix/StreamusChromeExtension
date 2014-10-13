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

    //  Load variables from Background -- don't require because then you'll load a whole instance of the background when you really just want a reference to specific parts.
    var Player = Streamus.backgroundPage.Player;
    var Settings = Streamus.backgroundPage.Settings;

    var ForegroundAreaView = Backbone.Marionette.LayoutView.extend({
        id: 'foregroundArea',
        className: 'column',
        template: _.template(ForegroundAreaTemplate),
        
        templateHelpers: function () {
            return {
                loadingYouTubeMessage: chrome.i18n.getMessage('loadingYouTube'),
                loadingYouTubeFailedMessage: chrome.i18n.getMessage('loadingYouTubeFailed'),
                reloadMessage: chrome.i18n.getMessage('reload'),
                loadAttempt: Player.get('loadAttempt'),
                maxLoadAttempts: Player.get('maxLoadAttempts')
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
            loadAttempt: '#foregroundArea-loadAttempt'
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

        initialize: function () {
            this.listenTo(Settings, 'change:showTooltips', this._onSettingsChangeShowTooltips);
            this.listenTo(Player, 'change:loading', this._onPlayerChangeLoading);
            this.listenTo(Player, 'change:loadAttempt', this._onPlayerChangeLoadAttempt);
            window.onunload = this._onWindowUnload.bind(this);
            window.onresize = this._onWindowResize.bind(this);
            window.onerror = this._onWindowError.bind(this);
        },
        
        onRender: function() {
            this._setHideTooltipsClass(Settings.get('showTooltips'));
            this._checkPlayerLoading();
        },
        
        onShow: function () {
            Backbone.Wreqr.radio.channel('foregroundArea').vent.trigger('shown');
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

            if (Player.get('ready')) {
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
            Backbone.Wreqr.radio.channel('global').vent.trigger('clickedElement', $(event.target));
        },
        
        _onWindowResize: function() {
            Backbone.Wreqr.radio.channel('window').vent.trigger('resize', {
                height: this.$el.height(),
                width: this.$el.width()
            });
        },
        
        //  Destroy the foreground to perform memory management / unbind event listeners. Memory leaks will be introduced if this doesn't happen.
        _onWindowUnload: function () {
            Streamus.backgroundPage.Backbone.Wreqr.radio.channel('foreground').vent.trigger('unload');
            this.destroy();
        },
        
        _onWindowError: function (message, url, lineNumber, columnNumber, error) {
            Streamus.backgroundPage.Backbone.Wreqr.radio.channel('error').commands.trigger('log:error', message, url, lineNumber, error);
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
        
        _onPlayerChangeLoadAttempt: function (model, loadAttempt) {
            this.ui.loadAttempt.text(loadAttempt);
        },
        
        _checkPlayerLoading: function () {
            if (Player.get('loading')) {
                this._startLoading();
            }
        }
    });

    return ForegroundAreaView;
});