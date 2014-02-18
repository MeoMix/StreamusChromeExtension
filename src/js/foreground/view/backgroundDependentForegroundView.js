//  Encapsulates the loading of views which are dependent on models which are instantiated through the background page.
//  This is necessary because it is possible to open the foreground before RequireJS has fully instantiated the background
//  This means that the foreground module wrappers for background entities will return null on initial load -- causing errors.
//  So, poll the background until it has loaded -- then load the views which depend on the background.
define([
    'foreground/eventAggregator',
    'foreground/model/foregroundViewManager',
    'foreground/model/genericPrompt',
    'foreground/view/prompt/genericPromptView',
    'foreground/model/playlistsArea',
    'foreground/view/playlistsArea/playlistsAreaView',
    'foreground/view/activePlaylistArea/activePlaylistAreaView',
    'foreground/view/videoSearch/videoSearchView',
    'foreground/model/videoSearch',
    'foreground/collection/videoSearchResults',
    'foreground/view/rightPane/rightPaneView',
    'foreground/collection/playlists',
    'enum/youTubePlayerError',
    'foreground/view/notificationView',
    'foreground/model/notification',
    'foreground/model/player',
    'foreground/model/settings',
    'foreground/model/user',
    'foreground/view/contextMenuView',
    'foreground/collection/contextMenuItems'
], function (EventAggregator, ForegroundViewManager, GenericPrompt, GenericPromptView, PlaylistsArea, PlaylistsAreaView, ActivePlaylistAreaView, VideoSearchView, VideoSearch, VideoSearchResults, RightPaneView, Playlists, YouTubePlayerError, NotificationView, Notification, Player, Settings, User, ContextMenuView, ContextMenuItems) {

    //  TODO: Maybe this should be an application and not a layout? I dunno.
    var BackgroundDependentForegroundView = Backbone.Marionette.Layout.extend({
        el: $('body'),

        playlistsAreaView: null,
        
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

            this.contextMenu.show(new ContextMenuView({
                collection: ContextMenuItems
            }));
            
            this.showActivePlaylistArea();
            
            if (Settings.get('alwaysOpenToSearch')) {
                this.showVideoSearch(false);
            } 
            
            this.listenTo(Playlists, 'change:active', this.showActivePlaylistArea);
            this.listenTo(Player, 'error', this.showYouTubeError);
            
            $(window).unload(this.deselectCollections.bind(this));
            ForegroundViewManager.subscribe(this);

            EventAggregator.on('activePlaylistAreaView:showVideoSearch, streamView:showVideoSearch', function () {
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
        showPlaylistsArea: function () {

            //  Defend against spam clicking by checking to make sure we're not instantiating currently
            if (this.playlistsAreaView === null) {

                var playlistsArea = new PlaylistsArea({
                    playlists: Playlists
                });

                this.playlistsAreaView = new PlaylistsAreaView({
                    model: playlistsArea,
                    collection: Playlists
                });

                this.$el.append(this.playlistsAreaView.render().el);
                this.playlistsAreaView.show();

                //  Cleanup whenever the model is destroyed.
                this.listenToOnce(playlistsArea, 'destroy', function () {
                    this.playlistsAreaView = null;
                });

            }

        },

        onClickShowVideoSearch: function () {
            this.showVideoSearch(true);
        },
        
        //  Cleans up any active playlist view and then renders a fresh view.
        showActivePlaylistArea: function () {
            var activePlaylist = Playlists.getActivePlaylist();

            //  Show the view using VideoSearchResults collection in which to render its results from.
            this.leftBasePane.show(new ActivePlaylistAreaView({
                model: activePlaylist,
                collection: activePlaylist ? activePlaylist.get('items') : undefined
            }));
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

            var youTubePlayerErrorPrompt = new GenericPromptView({
                model: new GenericPrompt({
                    title: chrome.i18n.getMessage('errorEncountered'),
                    view: new NotificationView({
                        model: new Notification({
                            text: text
                        })
                    })
                })
            });

            youTubePlayerErrorPrompt.fadeInAndShow();
        },
        
        //  If a click occurs and the default isn't prevented, reset the context menu groups to hide it.
        //  Child elements will call event.preventDefault() to indicate that they have handled the context menu.
        tryResetContextMenu: function (event) {
            console.log("resetting context menu items");
            if (event.isDefaultPrevented()) {

                //  TODO: I don't think this is the proper way to do this. I should be showing a new view with top/left defined?
                this.contextMenu.currentView.show({
                    top: event.pageY,
                    //  Show the element just slightly offset as to not break onHover effects.
                    left: event.pageX + 1
                });

            } else {
                
                //  Clearing the groups of the context menu will cause it to become hidden.
                ContextMenuItems.reset();
            }
        }

    });

    //  Only could ever possibly want 1 of these views... there's only 1 foreground.
    return new BackgroundDependentForegroundView();
});