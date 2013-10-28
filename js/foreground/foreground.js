//  When the foreground is loaded it will load all the ui elements. Grouped like this so I can wait for the
//  background YouTube player to load entirely before allowing foreground to open.
define([
    'settings',
    'reloadPromptView',
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
    'folders'
], function (Settings, ReloadPromptView, ActiveFolderArea, ActiveFolderAreaView, ActivePlaylistAreaView, ActivePlaylistArea, VideoSearchView, VideoSearch, AddSearchResults, AddSearchResultsView, VideoSearchResults, ContextMenuView, ContextMenuGroups, RightPaneView, Folders) {
    'use strict';

    var ForegroundView = Backbone.View.extend({

        el: $('body'),
        
        activeFolderAreaView: null,
        activePlaylistAreaView: null,
        videoSearchView: null,
        addSearchResults: null,
        rightPaneView: null,
        contextMenuView: new ContextMenuView,
        reloadPromptView: new ReloadPromptView,
        showReloadPromptTimeout: null,
               
        //  These are pulled from the background page. They'll be null until background is fully initialized.
        backgroundPlayer: chrome.extension.getBackgroundPage().YouTubePlayer,
        backgroundUser: chrome.extension.getBackgroundPage().User,

        events: {

            'click #addVideosButton': 'showVideoSearch',
            'click #activePlaylistArea button.show': 'showActiveFolderArea'
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

                //  TODO: Maybe just wait for a background isReady event and let the background handle this instead of polling?
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

        },
        
        //  Having the current user's information loaded from the server is critical for foreground functionality.
        waitForBackgroundUserLoaded: function () {

            this.listenTo(this.backgroundUser, 'change:loaded', function (model, loaded) {

                console.log("BackgroundUser change:loaded has fired:", model, loaded);

                if (loaded) {
                    this.waitForBackgroundPlayerReady();
                } else {
                    //  TODO: Display a loading message while user data is refreshing.
                    console.log("user is unloaded, waiting!");
                }

            });

            //  If the foreground is opened before the background has had a chance to load, wait for the background.
            //  This is easier than having every control on the foreground guard against the background not existing.
            if (this.backgroundUser.get('loaded')) {
                this.waitForBackgroundPlayerReady();
            }

        },
        
        //  Having the YouTube player functional is critical for foreground functionality.
        waitForBackgroundPlayerReady: function () {

            this.listenTo(this.backgroundPlayer, 'change:ready', function (model, ready) {

                if (ready) {
                    this.loadBackgroundDependentContent();
                } else {
                    console.log("BackgroundPlayer has gone unready, need to show message.");
                }

            });

            if (this.backgroundPlayer.get('ready')) {
                //  Load foreground when the background indicates it has loaded.
                this.loadBackgroundDependentContent();
            }
        },
        
        //  Once the user's information has been retrieved and the YouTube player is loaded -- setup the rest of the foreground.
        loadBackgroundDependentContent: function () {

            this.$el.removeClass('loading');
            clearTimeout(this.showReloadPromptTimeout);
            this.reloadPromptView.remove();

            var activeFolder = Folders.getActiveFolder();

            this.rightPaneView = new RightPaneView({
                activeFolder: activeFolder
            });
            this.$el.append(this.rightPaneView.render().el);

            this.showActivePlaylistArea();

            //  TODO: if activeFolder changes I think I'll need to unbind and rebind
            var playlists = activeFolder.get('playlists');
            this.listenTo(playlists, 'change:active', function (playlist, isActive) {

                if (isActive) {
                    this.showActivePlaylistArea();
                }

            });

            //  TODO: Refactor ALL of this. Just using it as a transitioning spot to get the new UI into views.

            return;

            //  VideoDisplayView properly uses a template so I can just remove and re-create it I believe.
            if (this.videoDisplayView) {
                this.videoDisplayView.remove();
            }
            this.videoDisplayView = new VideoDisplayView;

            this.listenTo(folders, 'change:active', function (folder, isActive) {

                //  TODO: Instead of calling changeModel, I would like to remove the view and re-add it.
                if (isActive) {
                    this.activeFolderAreaView.changeModel(folder);
                    this.streamView.changeModel(activeFolder);
                }

            });

        },
        
        //  Cleans up any active playlist view and then renders a fresh view.
        showActivePlaylistArea: function () {
            
            var activeFolder = Folders.getActiveFolder();

            if (this.activePlaylistAreaView !== null) {
                this.activePlaylistAreaView.remove();
            }

            var activePlaylistArea = new ActivePlaylistArea({
                playlist: activeFolder.getActivePlaylist()
            });

            this.activePlaylistAreaView = new ActivePlaylistAreaView({
                model: activePlaylistArea
            });

            this.$el.append(this.activePlaylistAreaView.render().el);
            
        },
        
        //  Slides in the ActiveFolderAreaView from the left side.
        showActiveFolderArea: function () {

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

        },
        
        //  Slide in the VideoSearchView from the left hand side.
        showVideoSearch: function () {

            var activeFolder = Folders.getActiveFolder();

            var videoSearch = new VideoSearch({
                relatedPlaylist: activeFolder.getActivePlaylist()
            });
            
            this.videoSearchView = new VideoSearchView({
                model: videoSearch
            });
            
            this.$el.append(this.videoSearchView.render().el);
            this.videoSearchView.showAndFocus();

            this.listenTo(VideoSearchResults, 'change:selected', function (changedItem, selected) {

                if (selected && this.addSearchResults === null) {
                    this.showAddSearchResults();
                }
                else if (!selected) {
                    
                    var noSearchResultsSelected = VideoSearchResults.selected().length === 0;

                    if (noSearchResultsSelected) {
                        this.addSearchResults.destroy();
                    }

                }

            });

            this.listenTo(VideoSearchResults, 'change:dragging', function(changedItem, dragging) {
                if (dragging && this.addSearchResults === null) {
                    this.showAddSearchResults();
                }
            });

            this.activePlaylistAreaView.hide();
            
            this.listenToOnce(videoSearch, 'destroy', function () {
                this.videoSearchView = null;
                
                //  When VideoSearch is hidden -- hide the AddSearchResults window as well because it's only useful then.
                if (this.addSearchResults !== null) {
                    this.addSearchResults.destroy();
                }
                
                this.activePlaylistAreaView.show();

                this.activePlaylistAreaView.activePlaylistItemsView.$el.trigger('manualShow');
            });

        },
        
        //  Slides in the AddSearchResults window from the RHS of the foreground.
        showAddSearchResults: function () {

            var activeFolder = Folders.getActiveFolder();

            this.addSearchResults = new AddSearchResults({
                folder: activeFolder
            });

            this.listenToOnce(this.addSearchResults, 'destroy', function () {
                this.addSearchResults = null;
            });

            var addSearchResultsView = new AddSearchResultsView({
                model: this.addSearchResults
            });

            this.$el.append(addSearchResultsView.render().el);
            addSearchResultsView.show();
            
        }
    });

    return new ForegroundView;
});