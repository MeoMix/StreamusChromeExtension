//  When the foreground is loaded it will load all the ui elements. Grouped like this so I can wait for the
//  background YouTube player to load entirely before allowing foreground to open.
define([
    'settings',
    'activeFolderTabView',
    'activePlaylistTabView',
    'streamView',
    'videoDisplayView',
    'volumeControlView',
    'playPauseButtonView',
    'nextButtonView',
    'previousButtonView',
    'shuffleButtonView',
    'radioButtonView',
    'repeatButtonView',
    'progressBarView',

    'headerTitleView'
], function (Settings, ActiveFolderTabView, ActivePlaylistTabView, StreamView, VideoDisplayView) {
    'use strict';

    var activeFolder = chrome.extension.getBackgroundPage().User.get('folders').getActiveFolder();

    //  TODO: There should probably be a ContentButtonView and Model which keep track of these properties and not just done on the ForegroundView.
    var ForegroundView = Backbone.View.extend({

        el: $('#contentWrapper'),
        
        activeFolderTabView: new ActiveFolderTabView({
            model: activeFolder
        }),

        activePlaylistTabView: new ActivePlaylistTabView({
            model: activeFolder.getActivePlaylist()
        }),

        streamView: new StreamView({
            model: activeFolder
        }),
        
        videoDisplayView: new VideoDisplayView,

        events: {
            //  TODO: Naming of menubutton vs content
            'click .menubutton': 'showContent'
        },

        render: function(){
            $('.content').hide();

            //  TODO: Pull active from a MenuButton collection instead of analyzing the View.
            var activeMenuButton = $('.menubutton.active');
            var activeContentId = activeMenuButton.data('content');
            
            $('#' + activeContentId).show();
            
            //  TODO: Fix this. It is used to manually trigger lazy-loading of images because they're visible, but its the wrong spot for the code.
            if (activeContentId == 'HomeContent') {
                this.activePlaylistTabView.activePlaylistView.$el.trigger('manualShow');
            }
            else if (activeContentId == 'VideoContent') {
                console.log("Rendering");
                this.videoDisplayView.render();
            }

        },

        initialize: function () {
            var self = this;

            console.log("INITIALIZING FOREGROUND");

            
            console.log("VideoContent:", this.$el.find('#VideoContent'));

            var folders = chrome.extension.getBackgroundPage().User.get('folders');

            this.listenTo(folders, 'change:active', function (folder, isActive) {
                
                //  TODO: Instead of calling changeModel, I would like to remove the view and re-add it.
                if (isActive) {
                    self.activeFolderTabView.changeModel(folder);
                    self.streamView.model = folder;
                }

            });

            //  TODO: if activeFolder changes I think I'll need to unbind and rebind
            var playlists = folders.getActiveFolder().get('playlists');
            this.listenTo(playlists, 'change:active', function (playlist, isActive) {

                //  TODO: Instead of calling changeModel, I would like to remove the view and re-add it.
                if (isActive) {
                    self.activePlaylistTabView.changeModel(playlist);
                }

            });
        
            //  Set the initially loaded content to whatever was clicked last or the home page as a default
            var activeContentButtonId = Settings.get('activeContentButtonId');
            var activeButton = $('#' + activeContentButtonId);

            this.setMenuButtonActive(activeButton);
            this.$el.find('#VideoContent').append(this.videoDisplayView.render().el);
        },

        showContent: function (event) {
            var clickedMenuButton = $(event.currentTarget);
            this.setMenuButtonActive(clickedMenuButton);
        },
        
        setMenuButtonActive: function(menuButton) {

            //  Clear content and show new content based on button clicked.
            $('.menubutton').removeClass('active');
            menuButton.addClass('active');

            Settings.set('activeContentButtonId', menuButton[0].id);

            this.render();
        }

    });

    return new ForegroundView;
});