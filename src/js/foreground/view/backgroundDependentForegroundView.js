//  Encapsulates the loading of views which are dependent on models which are instantiated through the background page.
//  This is necessary because it is possible to open the foreground before RequireJS has fully instantiated the background
//  This means that the foreground module wrappers for background entities will return null on initial load -- causing errors.
//  So, poll the background until it has loaded -- then load the views which depend on the background.
define([
    'foreground/model/foregroundViewManager',
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
    'foreground/model/player',
    'foreground/model/settings',
    'foreground/model/user'
], function (ForegroundViewManager, GenericPromptView, PlaylistsArea, PlaylistsAreaView, ActivePlaylistAreaView, VideoSearchView, VideoSearch, VideoSearchResults, RightPaneView, Playlists, YouTubePlayerError, NotificationView, Player, Settings, User) {

    //  TODO: Maybe this should be an application and not a layout? I dunno.
    var BackgroundDependentForegroundView = Backbone.Marionette.Layout.extend({
        //  Same as ForegroundView's element. That is OK.
        el: $('body'),

        playlistsAreaView: null,
        activePlaylistAreaView: null,
        rightPaneView: null,
        
        events: {
            'click': 'onClickDeselectCollections',
            'click button#showVideoSearch': 'onClickShowVideoSearch',
            'click #activePlaylistArea button.show': 'showPlaylistsArea',
            //  TODO: I really think this event handler should be in activePlaylistAreaView...
            'click #videoSearchLink': 'onClickShowVideoSearch'
        },
        
        regions: {
            leftBasePane: '#left-base-pane',
            leftCoveringPane: '#left-covering-pane'
        },

        initialize: function () {
            this.rightPaneView = new RightPaneView({
                model: Player
            });
            this.$el.append(this.rightPaneView.render().el);

            this.showActivePlaylistArea();
            
            if (Settings.get('alwaysOpenToSearch')) {
                this.showVideoSearch(false);
            } 
            
            this.listenTo(Playlists, 'change:active', this.showActivePlaylistArea);
            this.listenTo(Player, 'error', this.showYouTubeError);
            
            $(window).unload(this.deselectCollections.bind(this));
            ForegroundViewManager.subscribe(this);
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
            if (User.get('loaded')) {
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
                title: chrome.i18n.getMessage('errorEncountered'),
                model: new NotificationView({
                    text: text
                })
            });

            youTubePlayerErrorPrompt.fadeInAndShow();
        }

    });

    //  Only could ever possibly want 1 of these views... there's only 1 foreground.
    return new BackgroundDependentForegroundView();
});