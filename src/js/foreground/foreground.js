define([
    'common/enum/playerState',
    'common/enum/youTubePlayerError',
    'foreground/collection/contextMenuItems',
    'foreground/model/contextMenu',
    'foreground/model/playlistsArea',
    'foreground/model/notification',
    'foreground/model/search',
    'foreground/view/contextMenuView',
    'foreground/view/notificationView',
    'foreground/view/leftBasePane/leftBasePaneView',
    'foreground/view/leftCoveringPane/playlistsAreaView',
    'foreground/view/leftCoveringPane/searchView',
    'foreground/view/prompt/notificationPromptView',
    'foreground/view/prompt/reloadStreamusPromptView',
    'foreground/view/prompt/updateStreamusPromptView',
    'foreground/view/rightBasePane/rightBasePaneView'
], function (PlayerState, YouTubePlayerError, ContextMenuItems, ContextMenu, PlaylistsArea, Notification, Search, ContextMenuView, NotificationView, LeftBasePaneView, PlaylistsAreaView, SearchView, NotificationPromptView, ReloadStreamusPromptView, UpdateStreamusPromptView, RightBasePaneView) {
    'use strict';

    //  Load variables from Background -- don't require because then you'll load a whole instance of the background when you really just want a reference to specific parts.
    var Playlists = chrome.extension.getBackgroundPage().Playlists;
    var SearchResults = chrome.extension.getBackgroundPage().SearchResults;
    var StreamItems = chrome.extension.getBackgroundPage().StreamItems;
    var Player = chrome.extension.getBackgroundPage().YouTubePlayer;
    var Settings = chrome.extension.getBackgroundPage().Settings;
    var User = chrome.extension.getBackgroundPage().User;

    var ForegroundView = Backbone.Marionette.Layout.extend({
        el: $('body'),

        events: {
            //  TODO: is there no way to inline these event calls? Seems kinda silly to be so verbose.
            'click': function (event) {
                this.tryResetContextMenu(event);
                this.onClickDeselectCollections(event);
            },
            'contextmenu': 'tryResetContextMenu'
        },

        regions: {
            promptRegion: '#prompt-region',
            contextMenuRegion: "#context-menu-region",
            leftBasePaneRegion: '#left-base-pane-region',
            leftCoveringPaneRegion: '#left-covering-pane-region',
            rightBasePaneRegion: '#right-base-pane-region'
        },

        showReloadPromptTimeout: null,

        initialize: function () {
            //  Check if the YouTube player is loaded. If it isn't, give it a few seconds before allowing the user to restart.
            if (!Player.get('ready')) {
                this.$el.addClass('loading');
                this.startShowReloadPromptTimer();

                this.listenToOnce(Player, 'change:ready', function() {
                    this.$el.removeClass('loading');
                    clearTimeout(this.showReloadPromptTimeout);

                    //  Make sure another prompt didn't open (which would've closed the reload prompt)
                    if (this.promptRegion.currentView instanceof ReloadStreamusPromptView) {
                        this.promptRegion.close();
                    }
                });
            }

            this._promptIfUpdateAvailable();

            this.rightBasePaneRegion.show(new RightBasePaneView({
                model: Player
            }));
           
            this.leftBasePaneRegion.show(new LeftBasePaneView());

            if (Settings.get('alwaysOpenToSearch')) {
                this.showSearch(false);
            }

            this.listenTo(Settings, 'change:showTooltips', this.setHideTooltipsClass);
            this.setHideTooltipsClass();

            this.listenTo(Player, 'error', this.showYouTubeError);
            this.listenTo(Player, 'change:state', this.setPlayerStateClass);
            this.setPlayerStateClass();

            this.listenTo(window.Application.vent, 'showSearch', this.showSearch);
            this.listenTo(window.Application.vent, 'showPlaylistsArea', this.showPlaylistsArea);
            this.listenTo(window.Application.vent, 'showPrompt', this.showPrompt);

            //  Automatically sign the user in once they've actually interacted with Streamus.
            //  Don't sign in when the background loads because people who don't use Streamus, but have it installed, will bog down the server.
            if (User.canSignIn()) {
                User.signIn();
            }

            //  Only bind to unload in one spot -- the foreground closes unstoppably and not all unload events will fire reliably.
            $(window).unload(function () {
                this.close();
                this.deselectCollections();
            }.bind(this));
        },
        
        setHideTooltipsClass: function() {
            this.$el.toggleClass('hide-tooltips', !Settings.get('showTooltips'));
        },

        //  If the foreground hasn't properly initialized after 5 seconds offer the ability to restart the program.
        //  Background.js might have gone awry for some reason and it is not always clear how to restart Streamus via chrome://extension
        startShowReloadPromptTimer: function () {
            this.showReloadPromptTimeout = setTimeout(function () {
                this.showPrompt(new ReloadStreamusPromptView());
            }.bind(this), 5000);
        },
        
        showPrompt: function (view) {
            this.listenToOnce(view, 'hide', function () {
                this.promptRegion.close();
            });
            
            this.promptRegion.show(view);
        },

        //  Whenever the user clicks on any part of the UI that isn't a multi-select item, deselect the multi-select items.
        onClickDeselectCollections: function (event) {
            var isMultiSelectItem = $(event.target).hasClass('multi-select-item');

            //  Might've clicked inside of a multi-select item in which case you the de-select should not occur.
            var parentMultiSelectItem = $(event.target).closest('.multi-select-item');
            var isChildMultiSelectItem = parentMultiSelectItem.length > 0;

            if (!isMultiSelectItem && !isChildMultiSelectItem) {
                this.deselectCollections();
            }

            //  When clicking inside of a given multi-select, other multi-selects should be de-selected from.
            //  TODO: This is WAAAY too manual. Not sure how to clean it up just yet.
            var isPlaylistItem = $(event.target).hasClass('playlist-item') || parentMultiSelectItem.hasClass('playlist-item');
            if (isPlaylistItem) {
                SearchResults.deselectAll();
                StreamItems.deselectAll();
            }
            
            var isStreamItem = $(event.target).hasClass('stream-item') || parentMultiSelectItem.hasClass('stream-item');
            if (isStreamItem) {
                SearchResults.deselectAll();
                
                //  There's only an active playlist once the user has signed in.
                if (User.get('signedIn')) {
                    Playlists.getActivePlaylist().get('items').deselectAll();
                }
            }
            
            var isSearchResult = $(event.target).hasClass('search-result') || parentMultiSelectItem.hasClass('search-result');
            if (isSearchResult) {
                StreamItems.deselectAll();
                
                if (User.get('signedIn')) {
                    Playlists.getActivePlaylist().get('items').deselectAll();
                }
            }
        },
        
        deselectCollections: function () {
            if (User.get('signedIn')) {
                Playlists.getActivePlaylist().get('items').deselectAll();
            }

            SearchResults.deselectAll();
            StreamItems.deselectAll();
        },

        //  Slides in PlaylistsAreaView from the left side.
        showPlaylistsArea: _.throttle(function () {
            //  Defend against spam clicking by checking to make sure we're not instantiating currently
            if (_.isUndefined(this.leftCoveringPaneRegion.currentView)) {
                var playlistsArea = new PlaylistsArea();

                //  Show the view using SearchResults collection in which to render its results from.
                this.leftCoveringPaneRegion.show(new PlaylistsAreaView({
                    model: playlistsArea,
                    collection: Playlists
                }));

                //  When the user has clicked 'close' button the view will slide out and destroy its model. Cleanup events.
                this.listenToOnce(playlistsArea, 'destroy', function () {
                    this.leftCoveringPaneRegion.close();
                });
            }
        }, 400),

        //  Slide in SearchView from the left hand side.
        showSearch: _.throttle(function (doSnapAnimation) {
            //  Defend against spam clicking by checking to make sure we're not instantiating currently
            if (_.isUndefined(this.leftCoveringPaneRegion.currentView)) {
                //  Create model for the view and indicate whether view should appear immediately or display snap animation.
                var search = new Search({
                    playlist: Playlists.getActivePlaylist(),
                    doSnapAnimation: doSnapAnimation
                });

                //  Show the view using SearchResults collection in which to render its results from.
                this.leftCoveringPaneRegion.show(new SearchView({
                    collection: SearchResults,
                    model: search
                }));

                //  When the user has clicked 'close search' button the view will slide out and destroy its model. Cleanup events.
                this.listenToOnce(search, 'destroy', function () {
                    this.leftCoveringPaneRegion.close();
                });
            } else {
                //  Highlight the fact that is already visible by shaking it.
                this.leftCoveringPaneRegion.currentView.$el.effect('shake', {
                    distance: 3,
                    times: 3
                });
            }
        }, 400),

        //  Whenever the YouTube API throws an error in the background, communicate
        //  that information to the user in the foreground via prompt.
        showYouTubeError: function (youTubeError) {
            var text = chrome.i18n.getMessage('errorEncountered');

            switch (youTubeError) {
                case YouTubePlayerError.InvalidParameter:
                    text = chrome.i18n.getMessage('youTubePlayerErrorInvalidParameter');
                    break;
                case YouTubePlayerError.VideoNotFound:
                    text = chrome.i18n.getMessage('youTubePlayerErrorSongNotFound');
                    break;
                case YouTubePlayerError.NoPlayEmbedded:
                case YouTubePlayerError.NoPlayEmbedded2:
                    text = chrome.i18n.getMessage('youTubePlayerErrorNoPlayEmbedded');
                    break;
            }

            this.showPrompt(new NotificationPromptView({
                text: text
            }));
        },

        //  If a click occurs and the default isn't prevented, reset the context menu groups to hide it.
        //  Child elements will call event.preventDefault() to indicate that they have handled the context menu.
        tryResetContextMenu: function (event) {
            if (event.isDefaultPrevented()) {
                this.contextMenuRegion.show(new ContextMenuView({
                    collection: ContextMenuItems,
                    model: new ContextMenu({
                        top: event.pageY,
                        //  Show the element just slightly offset as to not break onHover effects.
                        left: event.pageX + 1
                    }),
                    containerHeight: this.$el.height(),
                    containerWidth: this.$el.width()
                }));
            } else {
                ContextMenuItems.reset();
                this.contextMenuRegion.close();
            }
        },
        
        //  Keep the player state represented on the body so CSS can be modified to reflect state.
        setPlayerStateClass: function () {
            var playerState = Player.get('state');
            this.$el.toggleClass('playing', playerState === PlayerState.Playing);
        },
        
        //  Make sure Streamus stays up to date because if my Server de-syncs people won't be able to save properly.
        //  http://developer.chrome.com/extensions/runtime#method-requestUpdateCheck
        _promptIfUpdateAvailable: function() {
            chrome.runtime.requestUpdateCheck(function (updateCheckStatus) {
                switch (updateCheckStatus) {
                    case 'update_available':
                        this.showPrompt(new UpdateStreamusPromptView());
                        break;
                    case 'no_update':
                    case 'throttled':
                        //  Nothing to do -- just can't ask again for a while if throttled, but that's pretty unlikely to happen, I think!
                        break;
                }
            }.bind(this));
        }
    });

    //  Only could ever possibly want 1 of these views... there's only 1 foreground.
    return new ForegroundView();
});