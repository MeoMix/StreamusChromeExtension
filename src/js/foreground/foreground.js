//  Encapsulates the loading of views which are dependent on models which are instantiated through the background page.
//  This is necessary because it is possible to open the foreground before RequireJS has fully instantiated the background
//  This means that the foreground module wrappers for background entities will return null on initial load -- causing errors.
//  So, poll the background until it has loaded -- then load the views which depend on the background.
define([
    'foreground/eventAggregator',
    'foreground/view/prompt/notificationPromptView',
    'foreground/view/prompt/reloadStreamusPromptView',
    'foreground/model/playlistsArea',
    'foreground/view/playlistsArea/playlistsAreaView',
    'foreground/view/leftBasePane/leftBasePaneView',
    'foreground/view/rightBasePane/rightBasePaneView',
    'foreground/model/videoSearch',
    'foreground/view/videoSearch/videoSearchView',
    'background/collection/streamItems',
    'background/collection/videoSearchResults',
    'background/collection/playlists',
    'common/enum/youTubePlayerError',
    'foreground/view/notificationView',
    'foreground/model/notification',
    'background/model/player',
    'background/model/settings',
    'background/model/user',
    'foreground/model/contextMenu',
    'foreground/view/contextMenuView',
    'foreground/collection/contextMenuItems',
    'common/enum/playerState'
], function (EventAggregator, NotificationPromptView, ReloadStreamusPromptView, PlaylistsArea, PlaylistsAreaView, LeftBasePaneView, RightBasePaneView, VideoSearch, VideoSearchView, StreamItems, VideoSearchResults, Playlists, YouTubePlayerError, NotificationView, Notification, Player, Settings, User, ContextMenu, ContextMenuView, ContextMenuItems, PlayerState) {

    //  TODO: Should this be an 'Application' object? MarionetteJS documentation says that it should start with an Application, but I kind of like a Layout.
    var ForegroundView = Backbone.Marionette.Layout.extend({
        el: $('body'),

        events: {
            'click': function (event) {
                this.tryResetContextMenu(event);
                this.onClickDeselectCollections(event);
            },
            'contextmenu': 'tryResetContextMenu'
        },

        regions: {
            dialogRegion: '#dialog-region',
            contextMenuRegion: "#context-menu-region",
            leftBasePaneRegion: '#left-base-pane-region',
            rightBasePaneRegion: '#right-base-pane-region',
            leftCoveringPaneRegion: '#left-covering-pane-region'
        },

        reloadPromptView: null,
        showReloadPromptTimeout: null,

        initialize: function () {

            //  Check if the YouTube player is loaded. If it isn't, give it a few seconds before allowing the user to restart.
            if (!Player.get('ready')) {
                this.$el.addClass('loading');

                this.startShowReloadPromptTimer();

                this.listenToOnce(Player, 'change:ready', function () {
                    this.$el.removeClass('loading');
                    clearTimeout(this.showReloadPromptTimeout);

                    if (this.reloadPromptView !== null) {
                        this.reloadPromptView.remove();
                    }
                });
            }

            this.rightBasePaneRegion.show(new RightBasePaneView({
                model: Player
            }));

            this.leftBasePaneRegion.show(new LeftBasePaneView());

            if (Settings.get('alwaysOpenToSearch')) {
                this.showVideoSearch(false);
            }

            this.listenTo(Player, 'error', this.showYouTubeError);
            this.listenTo(Player, 'change:state', this.setPlayerStateClass);
            this.setPlayerStateClass();

            //  Only bind to unload in one spot -- the foreground closes unstoppably and not all unload events will fire reliably.
            $(window).unload(function () {
                this.deselectCollections();
                //  SUPER IMPORTANT. Close the layout to unbind events from background page. Memory leak if not done.
                this.close();
            }.bind(this));

            EventAggregator.on('activePlaylistAreaView:showVideoSearch streamView:showVideoSearch', function () {
                this.showVideoSearch(true);
            }.bind(this));

            EventAggregator.on('activePlaylistAreaView:showPlaylistsArea', function () {
                this.showPlaylistsArea();
            }.bind(this));
        },

        //  If the foreground hasn't properly initialized after 5 seconds offer the ability to restart the program.
        //  Background.js might have gone awry for some reason and it is not always clear how to restart Streamus via chrome://extension
        startShowReloadPromptTimer: function () {
            this.showReloadPromptTimeout = setTimeout(function () {
                //  TODO: Use a region show to do this:
                this.reloadPromptView = new ReloadStreamusPromptView();
                this.reloadPromptView.fadeInAndShow();
            }.bind(this), 5000);
        },

        //  Whenever the user clicks on any part of the UI that isn't a multi-select item, deselect the multi-select items.
        onClickDeselectCollections: function (event) {
            var isMultiSelectItem = $(event.target).hasClass('multiSelectItem');

            var parentMultiSelectItem = $(event.target).closest('.multiSelectItem');
            var isChildMultiSelectItem = parentMultiSelectItem.length > 0;

            if (!isMultiSelectItem && !isChildMultiSelectItem) {
                this.deselectCollections();
            }

            //  TODO: This is WAAAY too manual. Not sure how to clean it up just yet.
            var isPlaylistItem = $(event.target).hasClass('playlistItem') || parentMultiSelectItem.hasClass('playlistItem');
            if (isPlaylistItem) {
                VideoSearchResults.deselectAll();
                StreamItems.deselectAll();
            }
            
            var isStreamItem = $(event.target).hasClass('streamItem') || parentMultiSelectItem.hasClass('streamItem');
            if (isStreamItem) {
                VideoSearchResults.deselectAll();
                
                if (User.get('signedIn')) {
                    Playlists.getActivePlaylist().get('items').deselectAll();
                }
            }
            
            var isVideoSearchResult = $(event.target).hasClass('videoSearchResult') || parentMultiSelectItem.hasClass('videoSearchResult');
            if (isVideoSearchResult) {
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

            VideoSearchResults.deselectAll();
            StreamItems.deselectAll();
        },

        //  Slides in PlaylistsAreaView from the left side.
        showPlaylistsArea: _.throttle(function () {

            //  Defend against spam clicking by checking to make sure we're not instantiating currently
            if (_.isUndefined(this.leftCoveringPaneRegion.currentView)) {

                var playlistsArea = new PlaylistsArea();

                //  Show the view using VideoSearchResults collection in which to render its results from.
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

        //  Slide in videoSearchView from the left hand side.
        showVideoSearch: _.throttle(function (doSnapAnimation) {

            //  Defend against spam clicking by checking to make sure we're not instantiating currently
            if (_.isUndefined(this.leftCoveringPaneRegion.currentView)) {

                //  Create model for the view and indicate whether view should appear immediately or display snap animation.
                var videoSearch = new VideoSearch({
                    playlist: Playlists.getActivePlaylist(),
                    doSnapAnimation: doSnapAnimation
                });

                //  Show the view using VideoSearchResults collection in which to render its results from.
                this.leftCoveringPaneRegion.show(new VideoSearchView({
                    collection: VideoSearchResults,
                    model: videoSearch
                }));

                //  When the user has clicked 'close video search' button the view will slide out and destroy its model. Cleanup events.
                this.listenToOnce(videoSearch, 'destroy', function () {
                    this.leftCoveringPaneRegion.close();
                });

            } else {
                //  Highlight the fact that is already visible by shaking it.
                this.leftCoveringPaneRegion.currentView.shake();
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
                    text = chrome.i18n.getMessage('youTubePlayerErrorVideoNotFound');
                    break;
                case YouTubePlayerError.NoPlayEmbedded:
                case YouTubePlayerError.NoPlayEmbedded2:
                    text = chrome.i18n.getMessage('youTubePlayerErrorNoPlayEmbedded');
                    break;
            }

            var youTubePlayerErrorPrompt = new NotificationPromptView({
                text: text
            });

            youTubePlayerErrorPrompt.fadeInAndShow();
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
                    })
                }));
            } else {
                ContextMenuItems.reset();
                this.contextMenuRegion.close();
            }
        },
        
        //  Keep the player state represented on the body so CSS can be modified to reflect state.
        setPlayerStateClass: function () {
            var playerState = Player.get('state');
            this.$el.toggleClass('playing', playerState === PlayerState.Playing || playerState === PlayerState.Buffering);
        }

    });

    //  Only could ever possibly want 1 of these views... there's only 1 foreground.
    return new ForegroundView();
});