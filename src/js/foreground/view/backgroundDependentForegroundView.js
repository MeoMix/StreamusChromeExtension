//  Encapsulates the loading of views which are dependent on models which are instantiated through the background page.
//  This is necessary because it is possible to open the foreground before RequireJS has fully instantiated the background
//  This means that the foreground module wrappers for background entities will return null on initial load -- causing errors.
//  So, poll the background until it has loaded -- then load the views which depend on the background.
define([
    'foreground/model/foregroundViewManager',
    'foreground/view/prompt/genericPromptView',
    'foreground/model/activeFolderArea',
    'foreground/view/activeFolderArea/activeFolderAreaView',
    'foreground/view/activePlaylistArea/activePlaylistAreaView',
    'foreground/view/videoSearch/videoSearchView',
    'foreground/model/videoSearch',
    'foreground/collection/videoSearchResults',
    'foreground/view/rightPane/rightPaneView',
    'common/view/videoDisplayView',
    'foreground/collection/folders',
    'enum/youTubePlayerError',
    'foreground/view/notificationView',
    'foreground/model/player',
    'foreground/model/buttons/videoDisplayButton',
    'foreground/model/settings'
], function (ForegroundViewManager, GenericPromptView, ActiveFolderArea, ActiveFolderAreaView, ActivePlaylistAreaView, VideoSearchView, VideoSearch, VideoSearchResults, RightPaneView, VideoDisplayView, Folders, YouTubePlayerError, NotificationView, Player, VideoDisplayButton, Settings) {

    //  TODO: Maybe this should be an application and not a layout? I dunno.
    var BackgroundDependentForegroundView = Backbone.Marionette.Layout.extend({
        //  Same as ForegroundView's element. That is OK.
        el: $('body'),

        activeFolderAreaView: null,
        activePlaylistAreaView: null,
        videoDisplayView: null,
        rightPaneView: null,
        
        events: {
            'click button#showVideoSearch': 'onClickShowVideoSearch',
            'click #activePlaylistArea button.show': 'showActiveFolderArea',
            //  TODO: I really think this event handler should be in activePlaylistAreaView...
            'click #videoSearchLink': 'onClickShowVideoSearch'
        },
        
        regions: {
            leftCoveringPane: '#left-covering-pane'
        },

        initialize: function () {
            this.rightPaneView = new RightPaneView();
            this.$el.append(this.rightPaneView.render().el);

            this.showActivePlaylistArea();
            
            if (Settings.get('alwaysOpenToSearch')) {
                this.showVideoSearch(false);
            }
            
            this.listenTo(Folders.getActiveFolder().get('playlists'), 'change:active', this.showActivePlaylistArea);
            this.listenTo(Player, 'error', this.showYouTubeError);

            //  TODO: It seems REALLY weird to have videoDisplayView be shown here but hidden by itself. Surely both thoughts should be on one or the other.
            if (VideoDisplayButton.get('enabled')) {
                //  Open instantly on first load.
                this.showVideoDisplay(true);
            }

            this.listenTo(VideoDisplayButton, 'change:enabled', function(model, enabled) {

                if (enabled) {
                    //  Show an animation when changing after first load.
                    this.showVideoDisplay(false);
                } else {
                    //  Whenever the VideoDisplayButton model indicates it has been disabled -- keep the view's state current.
                    this.videoDisplayView = null;
                }

            });
            
            $(window).unload(function () {
                Folders.getActiveFolder().get('playlists').getActivePlaylist().get('items').deselectAll();
                VideoSearchResults.deselectAll();
            });

            this.$el.click(function (event) {

                var isMultiSelectItem = $(event.target).hasClass('.multiSelectItem');
                var isChildMultiSelectItem = $(event.target).closest('.multiSelectItem').length > 0;

                if (!isMultiSelectItem && !isChildMultiSelectItem) {
                    Folders.getActiveFolder().get('playlists').getActivePlaylist().get('items').deselectAll();
                    VideoSearchResults.deselectAll();
                }

            });

            ForegroundViewManager.subscribe(this);
        },
        
        //  Cleans up any active playlist view and then renders a fresh view.
        showActivePlaylistArea: function () {

            var activePlaylist = Folders.getActiveFolder().getActivePlaylist();

            //  Build the view if it hasn't been rendered yet or re-build the view if it is outdated.
            if (this.activePlaylistAreaView === null || this.activePlaylistAreaView.model.get('playlist') !== activePlaylist) {

                //  Cleanup an existing view
                if (this.activePlaylistAreaView !== null) {
                    this.activePlaylistAreaView.remove();
                }

                console.log("activePlaylist:", activePlaylist.get('displayInfo'));

                //  TODO: rename this properly
                this.activePlaylistAreaView = new ActivePlaylistAreaView({
                    model: activePlaylist,
                    collection: activePlaylist.get('items')
                });

                this.$el.append(this.activePlaylistAreaView.render().el);
            }

        },

        //  Slides in the ActiveFolderAreaView from the left side.
        showActiveFolderArea: function () {

            //  Defend against spam clicking by checking to make sure we're not instantiating currently
            if (this.activeFolderAreaView === null) {

                var activeFolderArea = new ActiveFolderArea({
                    folder: Folders.getActiveFolder()
                });

                this.activeFolderAreaView = new ActiveFolderAreaView({
                    model: activeFolderArea
                });

                this.$el.append(this.activeFolderAreaView.render().el);
                this.activeFolderAreaView.show();

                //  Cleanup whenever the model is destroyed.
                this.listenToOnce(activeFolderArea, 'destroy', function () {
                    this.activeFolderAreaView = null;
                });

            }

        },

        onClickShowVideoSearch: function () {
            this.showVideoSearch(true);
        },
        
        showVideoDisplay: function (instant) {

            //  Defend against spam clicking by checking to make sure we're not instantiating currently
            if (this.videoDisplayView === null) {
                this.videoDisplayView = new VideoDisplayView();
                
                this.$el.append(this.videoDisplayView.render().el);
                this.videoDisplayView.show(instant);
            }

        },

        //  Slide in the VideoSearchView from the left hand side.
        //  TODO: Why is this throttled?
        showVideoSearch: _.throttle(function (doSnapAnimation) {

            //  Defend against spam clicking by checking to make sure we're not instantiating currently
            if (_.isUndefined(this.leftCoveringPane.currentView)) {
      
                var videoSearch = new VideoSearch({
                    playlist: Folders.getActiveFolder().getActivePlaylist(),
                    doSnapAnimation: doSnapAnimation
                });

                var videoSearchView = new VideoSearchView({
                    collection: VideoSearchResults,
                    model: videoSearch
                });

                this.leftCoveringPane.show(videoSearchView);

                this.listenToOnce(videoSearch, 'destroy', function() {
                    this.leftCoveringPane.close();
                });

            } else {
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