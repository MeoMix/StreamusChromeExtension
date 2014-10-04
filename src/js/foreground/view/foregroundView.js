define([
    'foreground/view/contextMenu/contextMenuRegion',
    'foreground/view/leftPane/leftPaneRegion',
    'foreground/view/notification/notificationRegion',
    'foreground/view/playlist/playlistsAreaRegion',
    'foreground/view/prompt/promptRegion',
    'foreground/view/rightPane/rightPaneRegion',
    'foreground/view/search/searchAreaRegion'
], function (ContextMenuRegion, LeftPaneRegion, NotificationRegion, PlaylistsAreaRegion, PromptRegion, RightPaneRegion, SearchAreaRegion) {
    'use strict';

    //  Load variables from Background -- don't require because then you'll load a whole instance of the background when you really just want a reference to specific parts.
    var Player = Streamus.backgroundPage.Player;
    var Settings = Streamus.backgroundPage.Settings;
    var SignInManager = Streamus.backgroundPage.SignInManager;
    var TabManager = Streamus.backgroundPage.TabManager;

    var ForegroundView = Backbone.Marionette.LayoutView.extend({
        el: $('body'),

        events: {
            //  TODO: I think it might make more sense to use mousedown instead of click because dragging elements doesn't hide the contextmenu
            'click': '_onClick',
            'contextmenu': '_onClick'
        },

        regions: {
            promptRegion: PromptRegion,
            notificationRegion: NotificationRegion,
            //  Depends on the view, set during initialize.
            //contextMenuRegion: null,
            leftPaneRegion: LeftPaneRegion,
            searchAreaRegion: SearchAreaRegion,
            playlistsAreaRegion: PlaylistsAreaRegion,
            rightPaneRegion: RightPaneRegion
        },

        initialize: function () {
            this._checkPlayerReady();
            this.listenTo(Player, 'change:ready', this._onPlayerChangeReady);

            this.promptRegion.promptIfNeedGoogleSignIn();
            this.promptRegion.promptIfNeedLinkUserId();
            this.promptRegion.promptIfUpdateAvailable();
            this._setContextMenuRegion();

            this.listenTo(Settings, 'change:showTooltips', this._setHideTooltipsClass);
            this._setHideTooltipsClass();

            //  Automatically sign the user in once they've actually interacted with Streamus.
            //  Don't sign in when the background loads because people who don't use Streamus, but have it installed, will bog down the server.
            SignInManager.signInWithGoogle();

            $(window).unload(this._onWindowUnload.bind(this));
            $(window).resize(this._onWindowResize.bind(this));
            
            if (Settings.get('alwaysOpenInTab')) {
                TabManager.showStreamusTab();
            }
            
            //  Do this only once ForegroundView has initialized to ensure the view reads proper height/width dimensions.
            if (Settings.get('alwaysOpenToSearch')) {
                this.searchAreaRegion.showSearchView(false);
            }
        },
        
        _setContextMenuRegion: function () {
            this.contextMenuRegion = new ContextMenuRegion({
                containerHeight: this.$el.height(),
                containerWidth: this.$el.width()
            });
        },
        
        //  Use some CSS to hide tooltips instead of trying to unbind/rebind all the event handlers.
        _setHideTooltipsClass: function () {
            this.$el.toggleClass('is-hidingTooltips', !Settings.get('showTooltips'));
        },
        
        //  Check if the YouTube player is loaded. If it isn't, place the UI into a loading state.
        _checkPlayerReady: function() {
            if (!Player.get('ready')) {
                this._startLoading();
            }
        },

        //  Give the program a few seconds before prompting the user to try restarting Streamus.
        _startLoading: function () {
            this.$el.addClass('is-showingSpinner');
            this.promptRegion.startShowReloadPromptTimer();
        },
        
        //  Set the foreground's view state to indicate that user interactions are OK once the player is ready.
        _stopLoading: function () {
            this.$el.removeClass('is-showingSpinner');
            this.promptRegion.hideReloadStreamusPrompt();
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
        }
    });

    //  Only could ever possibly want 1 of these views... there's only 1 foreground.
    return new ForegroundView();
});