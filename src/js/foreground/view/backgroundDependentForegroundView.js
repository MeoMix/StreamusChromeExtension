//  Encapsulates the loading of views which are dependent on models which are instantiated through the background page.
//  This is necessary because it is possible to open the foreground before RequireJS has fully instantiated the background
//  This means that the foreground module wrappers for background entities will return null on initial load -- causing errors.
//  So, poll the background until it has loaded -- then load the views which depend on the background.
define([
    'foreground/eventAggregator',
    'foreground/model/foregroundViewManager',
    'foreground/view/prompt/notificationPromptView',
    'foreground/model/playlistsArea',
    'foreground/view/playlistsArea/playlistsAreaView',
    'foreground/view/activePlaylistArea/activePlaylistAreaView',
    'foreground/model/videoSearch',
    'foreground/view/videoSearch/videoSearchView',
    'foreground/collection/videoSearchResults',
    'foreground/view/rightPane/rightPaneView',
    'foreground/collection/playlists',
    'enum/youTubePlayerError',
    'foreground/view/notificationView',
    'foreground/model/notification',
    'foreground/model/player',
    'foreground/model/settings',
    'foreground/model/user',
    'foreground/model/contextMenu',
    'foreground/view/contextMenuView',
    'foreground/collection/contextMenuItems'
], function (EventAggregator, ForegroundViewManager, NotificationPromptView, PlaylistsArea, PlaylistsAreaView, ActivePlaylistAreaView, VideoSearch, VideoSearchView, VideoSearchResults, RightPaneView, Playlists, YouTubePlayerError, NotificationView, Notification, Player, Settings, User, ContextMenu, ContextMenuView, ContextMenuItems) {

    var BackgroundDependentForegroundView = Backbone.Marionette.Layout.extend({
        el: $('body'),

        events: {
            'click': function(event) {
                this.tryResetContextMenu(event);
                this.onClickDeselectCollections(event);
            },
            'contextmenu': 'tryResetContextMenu'
        },
        
        regions: {
            dialog: '#dialog-region',
            contextMenu: "#context-menu-region",
            leftBasePane: '#left-base-pane-region',
            rightBasePane: '#right-base-pane-region',
            leftCoveringPane: '#left-covering-pane-region'
        },
        
        initialize: function () {
            this.$el.removeClass('loading');

            this.rightBasePane.show(new RightPaneView({
                model: Player
            }));
            
            this.showActivePlaylistArea();
            
            if (Settings.get('alwaysOpenToSearch')) {
                this.showVideoSearch(false);
            } 
            
            this.listenTo(Playlists, 'change:active', this.showActivePlaylistArea);
            this.listenTo(Player, 'error', this.showYouTubeError);
            
            $(window).unload(this.deselectCollections.bind(this));
            ForegroundViewManager.subscribe(this);

            EventAggregator.on('activePlaylistAreaView:showVideoSearch streamView:showVideoSearch', function () {
                this.showVideoSearch(true);
            }.bind(this));

            EventAggregator.on('activePlaylistAreaView:showPlaylistsArea', function () {
                this.showPlaylistsArea();
            }.bind(this));
        },
        
        //  Whenever the user clicks on any part of the UI that isn't a multi-select item, deselect the multi-select items.
        onClickDeselectCollections: function (event) {
            var isMultiSelectItem = $(event.target).hasClass('multiSelectItem');
            var isChildMultiSelectItem = $(event.target).closest('.multiSelectItem').length > 0;
 
            if (!isMultiSelectItem && !isChildMultiSelectItem) {
                this.deselectCollections();
            }
        },
        
        deselectCollections: function () {
            if (User.get('signedIn')) {
                Playlists.getActivePlaylist().get('items').deselectAll();
            }
            
            VideoSearchResults.deselectAll();
        },

        //  Slides in PlaylistsAreaView from the left side.
        showPlaylistsArea: _.throttle(function () {
            
            //  Defend against spam clicking by checking to make sure we're not instantiating currently
            if (_.isUndefined(this.leftCoveringPane.currentView)) {

                var playlistsArea = new PlaylistsArea({
                    playlists: Playlists
                });

                //  Show the view using VideoSearchResults collection in which to render its results from.
                this.leftCoveringPane.show(new PlaylistsAreaView({
                    model: playlistsArea,
                    collection: Playlists
                }));
                
                //  When the user has clicked 'close' button the view will slide out and destroy its model. Cleanup events.
                this.listenToOnce(playlistsArea, 'destroy', function () {
                    this.leftCoveringPane.close();
                });
            }

        }, 400),
        
        //  Cleans up any active playlist view and then renders a fresh view.
        showActivePlaylistArea: function () {
            var activePlaylist = Playlists.getActivePlaylist();

            //  TODO: I don't think I should be creating an ActivePlaylistAreaView if the collection is undefined.
            //  Show the view using VideoSearchResults collection in which to render its results from.
            this.leftBasePane.show(new ActivePlaylistAreaView({
                model: activePlaylist,
                collection: activePlaylist ? activePlaylist.get('items') : undefined
            }));

            this.listenTo(User, 'change:signedIn', function () {

                var activePlaylist = Playlists.getActivePlaylist();

                console.log("activePlaylist");

                this.leftBasePane.currentView.collection = activePlaylist.get('items');
                this.leftBasePane.currentView.render();
            });
        },

        //  Slide in videoSearchView from the left hand side.
        showVideoSearch: _.throttle(function (doSnapAnimation) {

            //  Defend against spam clicking by checking to make sure we're not instantiating currently
            if (_.isUndefined(this.leftCoveringPane.currentView)) {
      
                //  Create model for the view and indicate whether view should appear immediately or display snap animation.
                var videoSearch = new VideoSearch({
                    playlist: Playlists.getActivePlaylist(),
                    doSnapAnimation: doSnapAnimation
                });

                //  Show the view using VideoSearchResults collection in which to render its results from.
                this.leftCoveringPane.show(new VideoSearchView({
                    collection: VideoSearchResults,
                    model: videoSearch
                }));

                //  When the user has clicked 'close video search' button the view will slide out and destroy its model. Cleanup events.
                this.listenToOnce(videoSearch, 'destroy', function () {
                    this.leftCoveringPane.close();
                });

            } else {
                //  Highlight the fact that is already visible by shaking it.
                this.leftCoveringPane.currentView.shake();
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
                this.contextMenu.show(new ContextMenuView({
                    collection: ContextMenuItems,
                    model: new ContextMenu({
                        top: event.pageY,
                        //  Show the element just slightly offset as to not break onHover effects.
                        left: event.pageX + 1
                    })
                }));
            } else {
                ContextMenuItems.reset();
                this.contextMenu.close();
            }
        }

    });

    //  Only could ever possibly want 1 of these views... there's only 1 foreground.
    return new BackgroundDependentForegroundView();
});