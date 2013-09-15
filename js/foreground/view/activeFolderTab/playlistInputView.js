define([
    'contentHeaderView',
    'youTubeDataAPI',
    'dataSource'
], function (ContentHeaderView, YouTubeDataAPI, DataSource) {
    'use strict';

    var PlaylistInputView = Backbone.View.extend({
       
        contentHeaderView: null,
        
        className: 'header',
        
        events: {
            
            'keydown .addInput': 'processInputOnEnter',
            'paste .addInput': 'processInput',
            'drop .addInput': 'processInput',
            'focus .addInput': 'processInput'
            
        },
        
        render: function () {
            this.$el.html();
            this.$el.append(this.contentHeaderView.render().el);

            return this;
        },

        initialize: function () {
            var self = this;
            
            this.contentHeaderView = new ContentHeaderView({
                model: this.model.getActivePlaylist(),
                buttonText: 'Add Playlist',
                inputPlaceholderText: 'Enter a playlist name or YouTube playlist/channel URL',
                expanded: false
            });

            this.listenTo(this.model.get('playlists'), 'change:active', function(playlist, isActive) {

                if (isActive) {
                    self.contentHeaderView.changeModel(playlist);
                }

            });

        },
        
        processInputOnEnter: function (event) {

            if (event.which === $.ui.keyCode.ENTER) {
                this.processInput();
            }
            
        },
        
        //  Whenever the user submits a name for a new playlist create a new playlist with that name.
        processInput: function () {
            var self = this;
            
            //  Wrap in a setTimeout to let drop event finish (no real noticeable lag but keeps things DRY easier)
            setTimeout(function () {

                var userInput = self.contentHeaderView.getUserInput();

                //  Only add the playlist if something was provided.
                if (userInput !== '') {
                    self.contentHeaderView.clearUserInput();

                    var dataSource = YouTubeDataAPI.parseUrlForDataSource(userInput);
                    
                    switch (dataSource.type) {
                        case DataSource.USER_INPUT:
                            self.model.addPlaylistByDataSource(userInput, dataSource);
                            break;
                        case DataSource.YOUTUBE_PLAYLIST:

                            YouTubeDataAPI.getPlaylistTitle(dataSource.id, function (youTubePlaylistTitle) {
                                self.model.addPlaylistByDataSource(youTubePlaylistTitle, dataSource);
                            });

                            break;
                        case DataSource.YOUTUBE_CHANNEL:

                            YouTubeDataAPI.getChannelName(dataSource.id, function (channelName) {
                                var playlistTitle = channelName + '\'s Feed';
                                self.model.addPlaylistByDataSource(playlistTitle, dataSource);
                            });

                            break;
                        case DataSource.SHARED_PLAYLIST:
                            self.model.addPlaylistByDataSource('', dataSource);
                            break;
                        case DataSource.YOUTUBE_FAVORITES:

                            YouTubeDataAPI.getChannelName(dataSource.id, function (channelName) {
                                var playlistTitle = channelName + '\'s Feed';
                                self.model.addPlaylistByDataSource(playlistTitle, dataSource);
                            });

                            break;
                        default:
                            console.error("Unhandled dataSource type:", dataSource.type);
                    }

                }
            });
            
        }

    });


    return PlaylistInputView;
});