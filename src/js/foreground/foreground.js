define([
    'common/enum/playerState',
    'foreground/view/contextMenuRegion',
    'foreground/view/leftBasePane/leftBasePaneRegion',
    'foreground/view/leftCoveringPane/leftCoveringPaneRegion',
    'foreground/view/prompt/promptRegion',
    'foreground/view/rightBasePane/rightBasePaneRegion'
], function (PlayerState, ContextMenuRegion, LeftBasePaneRegion, LeftCoveringPaneRegion, PromptRegion, RightBasePaneRegion) {
    'use strict';

    //  Load variables from Background -- don't require because then you'll load a whole instance of the background when you really just want a reference to specific parts.
    var Player = chrome.extension.getBackgroundPage().YouTubePlayer;
    var Settings = chrome.extension.getBackgroundPage().Settings;
    var User = chrome.extension.getBackgroundPage().User;

    var ForegroundView = Backbone.Marionette.LayoutView.extend({
        el: $('body'),

        events: {
            'click': function (event) {
                this.contextMenuRegion.handleClickEvent(event);
                this.notifyMultiSelectCollections(event);
            },
            'contextmenu': function(event) {
                this.contextMenuRegion.handleClickEvent(event);
            }
        },

        regions: {
            promptRegion: PromptRegion,
            contextMenuRegion: ContextMenuRegion,
            leftBasePaneRegion: LeftBasePaneRegion,
            leftCoveringPaneRegion: LeftCoveringPaneRegion,
            rightBasePaneRegion: RightBasePaneRegion
        },

        initialize: function () {
            this.checkPlayerReady();
            this.promptRegion.promptIfUpdateAvailable();

            this.listenTo(Settings, 'change:showTooltips', this.setHideTooltipsClass);
            this.setHideTooltipsClass();

            this.listenTo(Player, 'change:state', this.setPlayerStateClass);
            this.setPlayerStateClass();

            //  Automatically sign the user in once they've actually interacted with Streamus.
            //  Don't sign in when the background loads because people who don't use Streamus, but have it installed, will bog down the server.
            if (User.canSignIn()) {
                User.signIn();
            }

            //  Destroy the foreground to perform memory management / unbind event listeners. Memory leaks will be introduced if this doesn't happen.
            $(window).unload(this.destroy.bind(this));
        },

        //  Whenever the user clicks on any part of the UI that isn't a multi-select item, fire events to deselect multi-select items.
        notifyMultiSelectCollections: function (event) {
            var clickedItem = $(event.target).closest('.multi-select-item');
            var isMultiSelectItem = clickedItem.length > 0;
            
            if (!isMultiSelectItem || !clickedItem.hasClass('playlist-item')) {
                window.Application.vent.trigger('clickedNonPlaylistItem');
            }
            
            if (!isMultiSelectItem || !clickedItem.hasClass('stream-item')) {
                window.Application.vent.trigger('clickedNonStreamItem');
            }
            
            if (!isMultiSelectItem || !clickedItem.hasClass('search-result')) {
                window.Application.vent.trigger('clickedNonSearchResult');
            }
        },
        
        //  Keep the player state represented on the body so CSS can easily reflect the state of the Player.
        setPlayerStateClass: function () {
            var playerState = Player.get('state');
            this.$el.toggleClass('playing', playerState === PlayerState.Playing);
        },
        
        //  Use some CSS to hide tooltips instead of trying to unbind/rebind all the event handlers.
        setHideTooltipsClass: function () {
            this.$el.toggleClass('hide-tooltips', !Settings.get('showTooltips'));
        },
        
        //  Check if the YouTube player is loaded. If it isn't, place the UI into a loading state.
        checkPlayerReady: function() {
            if (!Player.get('ready')) {
                this.startLoading();
            }
        },

        //  Give the program a few seconds before prompting the user to try restarting Streamus.
        startLoading: function() {
            this.$el.addClass('loading');
            this.promptRegion.startShowReloadPromptTimer();
            this.listenToOnce(Player, 'change:ready', this.stopLoading);
        },
        
        //  Set the foreground's view state to indicate that user interactions are OK once the player is ready.
        stopLoading: function() {
            this.$el.removeClass('loading');
            this.promptRegion.hideReloadStreamusPrompt();
        }
    });

    //  Only could ever possibly want 1 of these views... there's only 1 foreground.
    return new ForegroundView();
});