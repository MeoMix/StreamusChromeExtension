//  When the foreground is loaded it will load all the ui elements. Grouped like this so I can wait for the
//  background YouTube player to load entirely before allowing foreground to open.
define([
    'settings',
    'newForegroundUi',
    'loadingSpinnerView',
    'reloadPromptView',
    'activeFolderTabView',
    'activePlaylistAreaView',
    'activePlaylistArea',
    'videoSearchView',
    'videoSearch'
], function (Settings, newForegroundUi, LoadingSpinnerView, ReloadPromptView, ActiveFolderTabView, ActivePlaylistAreaView, ActivePlaylistArea, VideoSearchView, VideoSearch) {
    'use strict';

    var ForegroundView = Backbone.View.extend({

        el: $('body'),
        
        //  TODO: These probably don't need to be null at the start.
        activeFolderTabView: null,
        activePlaylistAreaView: null,
        videoSearchView: null,

        loadingSpinnerView: new LoadingSpinnerView,
        reloadPromptView: new ReloadPromptView,
        showReloadPromptTimeout: null,
               
        //  These are pulled from the background page. They'll be null until background is fully initialized.
        backgroundPlayer: chrome.extension.getBackgroundPage().YouTubePlayer,
        backgroundUser: chrome.extension.getBackgroundPage().User,

        events: {
            
            'click #addVideosButton': 'showVideoSearch',
            'click #button-back': 'hideVideoSearch'

        },

        initialize: function () {
            
            var self = this;

            this.$el.append(this.loadingSpinnerView.render().el);

            //  If the foreground hasn't properly initialized after 5 seconds offer the ability to restart the program.
            //  Background.js might have gone awry for some reason and it is not always clear how to restart Streamus via chrome://extension
            this.showReloadPromptTimeout = setTimeout(function () {
                
                var reloadPromptElement = self.reloadPromptView.render().el;
                self.$el.append(reloadPromptElement);
                
                $(reloadPromptElement).find('.panel').fadeIn(200, function () {
                    $(reloadPromptElement).addClass('visible');
                });
                
            }, 5000);

            //  If the user opens the foreground SUPER FAST then requireJS won't have been able to load everything in the background in time.
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

        },
        
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
        
        loadBackgroundDependentContent: function () {
            this.$el.removeClass('loading');
            clearTimeout(this.showReloadPromptTimeout);
            this.reloadPromptView.remove();
            this.loadingSpinnerView.remove();

            var activeFolder = this.backgroundUser.get('folders').getActiveFolder();

            //  TODO: Instead of calling changeModel I should be removing/recreating my views I think.
            if (this.activeFolderTabView === null) {
                this.activeFolderTabView = new ActiveFolderTabView({
                    model: activeFolder
                });
            } else {
                this.activeFolderTabView.changeModel(activeFolder);
            }

            var activePlaylistArea = new ActivePlaylistArea({
                playlist: activeFolder.getActivePlaylist()
            });

            if (this.activePlaylistAreaView === null) {

                this.activePlaylistAreaView = new ActivePlaylistAreaView({
                    model: activePlaylistArea
                });

                this.$el.append(this.activePlaylistAreaView.render().el);

            } else {
                this.activePlaylistAreaView.changeModel(activePlaylistArea);
            }

            //  TODO: Refactor ALL of this. Just using it as a transitioning spot to get the new UI into views.
            this.videoSearchView = new VideoSearchView({
                model: new VideoSearch({
                    relatedPlaylist: activeFolder.getActivePlaylist()
                })
            });
            this.$el.append(this.videoSearchView.render().el);


            return;

            if (this.streamView === null) {

                this.streamView = new StreamView({
                    model: activeFolder
                });

            } else {
                this.streamView.changeModel(activeFolder);
            }

            //  VideoDisplayView properly uses a template so I can just remove and re-create it I believe.
            if (this.videoDisplayView) {
                this.videoDisplayView.remove();
            }
            this.videoDisplayView = new VideoDisplayView;

            var folders = this.backgroundUser.get('folders');

            this.listenTo(folders, 'change:active', function (folder, isActive) {

                //  TODO: Instead of calling changeModel, I would like to remove the view and re-add it.
                if (isActive) {
                    this.activeFolderTabView.changeModel(folder);
                    this.streamView.changeModel(activeFolder);
                }

            });

            //  TODO: if activeFolder changes I think I'll need to unbind and rebind
            var playlists = folders.getActiveFolder().get('playlists');
            this.listenTo(playlists, 'change:active', function (playlist, isActive) {

                //  TODO: Instead of calling changeModel, I would like to remove the view and re-add it.
                if (isActive) {
                    
                    var activePlaylistArea = new ActivePlaylistArea({
                        playlist: activeFolder.getActivePlaylist()
                    });

                    this.activePlaylistAreaView.changeModel(playlist);
                }

            });

            //  Set the initially loaded content to whatever was clicked last or the home page as a default
            //  TODO: Remove the string replace in a few versions, I changed localStorage names and need to support old versions for a while.
            var activeContentButtonId = Settings.get('activeContentButtonId').replace('Menu', 'Content');
            var activeContentButton = $('#' + activeContentButtonId);

            this.setContentButtonActive(activeContentButton);
            this.$el.find('#VideoContent').append(this.videoDisplayView.render().el);

            this.radioButtonView = new RadioButtonView({
                model: chrome.extension.getBackgroundPage().RadioButton
            });
            this.$el.find('#menu').append(this.radioButtonView.render().el);

            this.repeatButtonView = new RepeatButtonView({
                model: chrome.extension.getBackgroundPage().RepeatButton
            });
            this.$el.find('#menu').append(this.repeatButtonView.render().el);

            this.shuffleButtonView = new ShuffleButtonView({
                model: chrome.extension.getBackgroundPage().ShuffleButton
            });
            this.$el.find('#menu').append(this.shuffleButtonView.render().el);

            this.playPauseButtonView = new PlayPauseButtonView({
                model: chrome.extension.getBackgroundPage().PlayPauseButton
            });
            this.$el.find('#Header').before(this.playPauseButtonView.render().el);

            this.nextButtonView = new NextButtonView({
                model: chrome.extension.getBackgroundPage().NextButton
            });
            this.$el.find('#Header').after(this.nextButtonView.render().el);

            this.previousButtonView = new PreviousButtonView({
                model: chrome.extension.getBackgroundPage().PreviousButton
            });
            this.$el.find('#Header').after(this.previousButtonView.render().el);
        },
        
        showVideoSearch: function () {

            this.videoSearchView.showAndFocus();

            $("#button-playlists, #playlists").fadeOut();
            $("#button-back").fadeIn();
        },
        
        hideVideoSearch: function () {
            console.log("Hiding video search");
            this.videoSearchView.hide();
            
            $("#button-back").fadeOut();
            $("#button-playlists, #playlists").fadeIn();

            console.log("Triggering manual show");
            this.activePlaylistAreaView.activePlaylistItemsView.$el.trigger('manualShow');
        }
    });

    return new ForegroundView;
});