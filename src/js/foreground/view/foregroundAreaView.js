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
    var YouTubePlayer = Streamus.backgroundPage.YouTubePlayer;
    var Settings = Streamus.backgroundPage.Settings;
    var SignInManager = Streamus.backgroundPage.SignInManager;

    var ForegroundAreaView = Backbone.Marionette.LayoutView.extend({
        id: 'foregroundArea',
        className: 'column',
        template: _.template(ForegroundAreaTemplate),
        
        templateHelpers: function () {
            return {
                loadingYouTubeAPIMessage: chrome.i18n.getMessage('loadingYouTubeAPI'),
                loadYouTubeAPIFailedMessage: chrome.i18n.getMessage('loadYouTubeAPIFailed'),
                reloadMessage: chrome.i18n.getMessage('reload')
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
            loadFailedMessage: '#foregroundArea-loadFailedMessage',
            reloadLink: '#foregroundArea-reloadLink'
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
            this.listenTo(Player, 'change:ready', this._onPlayerChangeReady);
            this.listenTo(Settings, 'change:showTooltips', this._onSettingsChangeShowTooltips);
            this.listenTo(YouTubePlayer, 'change:loadFailed', this._onYouTubePlayerChangeLoadFailed);
            $(window).unload(this._onWindowUnload.bind(this));
            $(window).resize(this._onWindowResize.bind(this));
        },
        
        onRender: function() {
            this._setHideTooltipsClass(Settings.get('showTooltips'));
        },
        
        onShow: function () {
            this._checkPlayerReady();

            //  Automatically sign the user in once they've actually interacted with Streamus.
            //  Don't sign in when the background loads because people who don't use Streamus, but have it installed, will bog down the server.
            SignInManager.signInWithGoogle();

            Backbone.Wreqr.radio.channel('foregroundArea').vent.trigger('shown');
        },
        
        //  Use some CSS to hide tooltips instead of trying to unbind/rebind all the event handlers.
        _setHideTooltipsClass: function (showTooltips) {
            this.$el.toggleClass('is-hidingTooltips', !showTooltips);
        },
        
        //  Check if the player is loaded. If it isn't, place the UI into a loading state.
        _checkPlayerReady: function () {
            if (!Player.get('ready')) {
                this._startLoading();
            }
        },

        //  TODO: The message here indicates that I'm loading YouTube's API, which is true, but will need to be expanded for SoundCloud soon.
        //  Give the program a few seconds before prompting the user to try restarting Streamus.
        _startLoading: function () {
            this.$el.addClass('is-showingSpinner');
            this.ui.loadingMessage.removeClass('hidden');
            
            if (YouTubePlayer.get('loadFailed')) {
                this._onLoadFailed();
            }
        },
        
        _onLoadFailed: function () {
            //  TODO: Just monitoring this for a while to see if it happens to people very frequently.
            Streamus.backgroundPage.ClientErrorManager.logErrorMessage("loadFailed");

            //  TODO: Technically I should be removing 'is-showingSpinner' class because no spinner is showing, but I still want everything grayed out on failure.
            this.ui.loadingMessage.addClass('hidden');
            this.ui.loadFailedMessage.removeClass('hidden');
        },
        
        //  Set the foreground's view state to indicate that user interactions are OK once the player is ready.
        _stopLoading: function () {
            this.$el.removeClass('is-showingSpinner');
            this.ui.loadingMessage.addClass('hidden');
            this.ui.loadFailedMessage.addClass('hidden');
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
            Streamus.backgroundPage.Streamus.onForegroundUnload();
            this.destroy();
        },
        
        _onPlayerChangeReady: function (model, ready) {
            ready ? this._stopLoading() : this._startLoading();
        },
        
        _onSettingsChangeShowTooltips: function(model, showTooltips) {
            this._setHideTooltipsClass(showTooltips);
        },
        
        _onYouTubePlayerChangeLoadFailed: function(model, loadFailed) {
            if (loadFailed) {
                this._onLoadFailed();
            }
        },
        
        _onClickReloadLink: function() {
            chrome.runtime.reload();
        }
    });

    return ForegroundAreaView;
});