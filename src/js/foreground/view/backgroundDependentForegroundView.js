//  Encapsulates the loading of views which are dependent on models which are instantiated through the background page.
//  This is necessary because it is possible to open the foreground before RequireJS has fully instantiated the background
//  This means that the foreground module wrappers for background entities will return null on initial load -- causing errors.
//  So, poll the background until it has loaded -- then load the views which depend on the background.
define([
    'foreground/view/genericForegroundView',
    'foreground/view/genericPromptView',
    'foreground/model/activeFolderArea',
    'foreground/view/activeFolderArea/activeFolderAreaView',
    'foreground/view/activePlaylistArea/activePlaylistAreaView',
    'foreground/model/activePlaylistArea',
    'foreground/view/videoSearch/videoSearchView',
    'foreground/model/videoSearch',
    'foreground/model/addSearchResults',
    'foreground/view/videoSearch/addSearchResultsView',
    'foreground/collection/videoSearchResults',
    'foreground/view/rightPane/rightPaneView',
    'foreground/view/video/videoDisplayView',
    'foreground/collection/folders',
    'enum/youTubePlayerError',
    'foreground/view/notificationView',
    'foreground/model/player'
], function (GenericForegroundView, GenericPromptView, ActiveFolderArea, ActiveFolderAreaView, ActivePlaylistAreaView, ActivePlaylistArea, VideoSearchView, VideoSearch, AddSearchResults, AddSearchResultsView, VideoSearchResults, RightPaneView, VideoDisplayView, Folders, YouTubePlayerError, NotificationView, Player) {

    var BackgroundDependentForegroundView = GenericForegroundView.extend({
        //  Same as ForegroundView's element. That is OK.
        el: $('body'),

        activeFolderAreaView: null,
        activePlaylistAreaView: null,
        videoSearchView: null,
        videoDisplayView: null,
        addSearchResultsView: null,
        rightPaneView: new RightPaneView(),
        
        events: {

            'click #addVideosButton': 'onClickShowVideoSearch',
            'click #activePlaylistArea button.show': 'showActiveFolderArea'
            //'click #videoDisplayButton': 'onClickShowVideoDisplay'

        },

        initialize: function() {
            this.$el.append(this.rightPaneView.render().el);

            this.showActivePlaylistArea();
            this.showVideoSearch(true);
            
            this.listenTo(Folders.getActiveFolder().get('playlists'), 'change:active', this.showActivePlaylistArea);
            this.listenTo(Player, 'error', this.showYouTubeError);
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

                var activePlaylistArea = new ActivePlaylistArea({
                    playlist: activePlaylist
                });

                this.activePlaylistAreaView = new ActivePlaylistAreaView({
                    model: activePlaylistArea
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
            this.showVideoSearch(false);
        },

        onClickShowVideoDisplay: function () {

            //  Defend against spam clicking by checking to make sure we're not instantiating currently
            if (this.videoDisplayView === null) {

                this.videoDisplayView = new VideoDisplayView({

                });

                this.$el.append(this.videoDisplayView.render().el);
                this.videoDisplayView.show();
            }

        },

        //  Slide in the VideoSearchView from the left hand side.
        showVideoSearch: function (instant) {

            //  Defend against spam clicking by checking to make sure we're not instantiating currently
            if (this.videoSearchView === null) {

                var videoSearch = new VideoSearch({
                    playlist: Folders.getActiveFolder().getActivePlaylist()
                });

                this.videoSearchView = new VideoSearchView({
                    model: videoSearch
                });

                this.$el.append(this.videoSearchView.render().el);
                this.videoSearchView.showAndFocus(instant);

                this.listenTo(VideoSearchResults, 'change:selected', function (changedItem, selected) {
                    //  Whenever a search result is selected - slide in search results.
                    if (selected && this.addSearchResultsView === null) {
                        this.showAddSearchResults();
                    }
                });

                this.listenToOnce(videoSearch, 'destroy', function () {
                    this.videoSearchView = null;

                    //  Adding search results is only useful with the video search view.
                    if (this.addSearchResultsView !== null) {
                        this.addSearchResultsView.hide();
                        this.addSearchResultsView = null;
                    }

                });

            }

        },

        //  Slides in the AddSearchResults window from the RHS of the foreground.
        showAddSearchResults: function () {

            //  If the view has already been rendered -- no need to reshow.
            if (this.addSearchResultsView === null) {

                var addSearchResults = new AddSearchResults({
                    folder: Folders.getActiveFolder()
                });

                this.addSearchResultsView = new AddSearchResultsView({
                    model: addSearchResults
                });

                //  Cleanup if the model is ever destroyed.
                this.listenToOnce(addSearchResults, 'destroy', function () {
                    this.addSearchResultsView = null;
                });

                this.$el.append(this.addSearchResultsView.render().el);
                this.addSearchResultsView.show();
            }

        },

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