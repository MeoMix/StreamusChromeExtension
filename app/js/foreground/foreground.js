//  When the foreground is loaded it will load all the ui elements. Grouped like this so I can wait for the
//  background YouTube player to load entirely before allowing foreground to open.
define([
    'genericForegroundView',
    'genericPromptView',
    'reloadView',
    'activeFolderArea',
    'activeFolderAreaView',
    'activePlaylistAreaView',
    'activePlaylistArea',
    'videoSearchView',
    'videoSearch',
    'addSearchResults',
    'addSearchResultsView',
    'videoSearchResults',
    'contextMenuView',
    'contextMenuGroups',
    'rightPaneView',
    'folders',
    'videoDisplayView',
    'youTubePlayerError',
    'notificationView'
], function (GenericForegroundView, GenericPromptView, ReloadView, ActiveFolderArea, ActiveFolderAreaView, ActivePlaylistAreaView, ActivePlaylistArea, VideoSearchView, VideoSearch, AddSearchResults, AddSearchResultsView, VideoSearchResults, ContextMenuView, ContextMenuGroups, RightPaneView, Folders, VideoDisplayView, YouTubePlayerError, NotificationView) {
    'use strict';

    var ForegroundView = GenericForegroundView.extend({

        el: $('body'),
        
        activeFolderAreaView: null,
        activePlaylistAreaView: null,
        videoSearchView: null,
        videoDisplayView: null,
        addSearchResultsView: null,
        rightPaneView: null,
        contextMenuView: new ContextMenuView(),
        reloadPromptView: new GenericPromptView({
            title: chrome.i18n.getMessage('reloadStreamus'),
            okButtonText: chrome.i18n.getMessage('reloadButtonText'),
            cancelButtonText: chrome.i18n.getMessage('waitButtonText'),
            model: new ReloadView()
        }),
        showReloadPromptTimeout: null,
               
        //  These are pulled from the background page. They'll be null until background is fully initialized.
        backgroundPlayer: chrome.extension.getBackgroundPage().YouTubePlayer,
        backgroundUser: chrome.extension.getBackgroundPage().User,

        events: {

            'click #addVideosButton': 'onClickShowVideoSearch',
            'click #activePlaylistArea button.show': 'showActiveFolderArea'
            //'click #videoDisplayButton': 'onClickShowVideoDisplay'

        },

        initialize: function () {
            chrome.extension.getBackgroundPage()._gaq.push(['_trackPageview']);
            
            var self = this;
            
            this.$el.append(this.contextMenuView.render().el);

            //  If the foreground hasn't properly initialized after 5 seconds offer the ability to restart the program.
            //  Background.js might have gone awry for some reason and it is not always clear how to restart Streamus via chrome://extension
            this.showReloadPromptTimeout = setTimeout(function () {
                
                self.reloadPromptView.fadeInAndShow();

            }, 5000);

            //  If the user opens the foreground SUPER FAST after installing then requireJS won't have been able to load everything in the background in time.
            if (this.backgroundPlayer == null || this.backgroundUser == null) {

                //  Poll the background until it is ready.
                var checkBackgroundLoadedInterval = setInterval(function () {

                    self.backgroundPlayer = chrome.extension.getBackgroundPage().YouTubePlayer;
                    self.backgroundUser = chrome.extension.getBackgroundPage().User;

                    if (self.backgroundPlayer != null && self.backgroundUser != null) {

                        clearInterval(checkBackgroundLoadedInterval);
                        self.waitForBackgroundUserLoaded();
                    }

                }, 100);

            } else {
                this.waitForBackgroundUserLoaded();
            }

            //  If a click occurs and the default isn't prevented, reset the context menu groups to hide it.
            //  Child elements will call event.preventDefault() to indicate that they have handled the context menu.
            this.$el.on('click contextmenu', function (event) {

                var isDefaultPrevented = event.isDefaultPrevented();
                
                if (isDefaultPrevented) {

                    self.contextMenuView.show({
                        top: event.pageY,
                        //  Show the element just slightly offset as to not break onHover effects.
                        left: event.pageX + 1
                    });
                    
                } else {
                    //  Clearing the groups of the context menu will cause it to become hidden.
                    ContextMenuGroups.reset();
                }

            });
            
            if (VideoSearchResults.length > 0) {
                this.showVideoSearch(true);
            }

        },
        
        //  Having the current user's information loaded from the server is critical for foreground functionality.
        waitForBackgroundUserLoaded: function () {

            //  If the foreground is opened before the background has had a chance to load, wait for the background.
            //  This is easier than having every control on the foreground guard against the background not existing.
            if (this.backgroundUser.get('loaded')) {
                this.waitForBackgroundPlayerReady();
            } else {

                this.listenToOnce(this.backgroundUser, 'change:loaded', function (model, loaded) {

                    if (loaded) {
                        this.waitForBackgroundPlayerReady();
                    }

                });
            }

        },
        
        //  Having the YouTube player functional is critical for foreground functionality.
        waitForBackgroundPlayerReady: function () {
   
            if (this.backgroundPlayer.get('ready')) {
                //  Load foreground when the background indicates it has loaded.
                this.loadBackgroundDependentContent();
            } else {
                this.listenToOnce(this.backgroundPlayer, 'change:ready', function (model, ready) {

                    if (ready) {
                        this.loadBackgroundDependentContent();
                    }

                });
            }
        },
        
        //  Once the user's information has been retrieved and the YouTube player is loaded -- setup the rest of the foreground.
        loadBackgroundDependentContent: function () {

            this.$el.removeClass('loading');
            clearTimeout(this.showReloadPromptTimeout);
            this.reloadPromptView.remove();

            //  TODO: Folders could potentially be undefined.
            var activeFolder = Folders.getActiveFolder();

            this.rightPaneView = new RightPaneView({
                activeFolder: activeFolder
            });
            this.$el.append(this.rightPaneView.render().el);

            this.showActivePlaylistArea();
            this.listenTo(activeFolder.get('playlists'), 'change:active', this.showActivePlaylistArea);

            this.listenTo(this.backgroundPlayer, 'error', this.showYouTubeError);
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
                
                var activeFolder = Folders.getActiveFolder();

                var activeFolderArea = new ActiveFolderArea({
                    folder: activeFolder
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
        
        onClickShowVideoDisplay: function() {

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

                var activeFolder = Folders.getActiveFolder();

                var videoSearch = new VideoSearch({
                    playlist: activeFolder.getActivePlaylist()
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
                
                var activeFolder = Folders.getActiveFolder();

                var addSearchResults = new AddSearchResults({
                    folder: activeFolder
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
        
        showYouTubeError: function(youTubeError) {

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

    return new ForegroundView();
});