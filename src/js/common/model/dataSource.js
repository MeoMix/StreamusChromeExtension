define([
    'common/enum/dataSourceType',
    'common/enum/youTubeServiceType',
    'common/model/youTubeV3API'
], function (DataSourceType, YouTubeServiceType, YouTubeV3API) {
    'use strict';

    var DataSource = Backbone.Model.extend({
        defaults: {
            type: DataSourceType.None,
            //  Valid song ID can appear in a playlist URL so provide the ability to only pull out a playlist URL
            parseVideo: true,
            //  The songId, playlistId, channelId etc..
            id: '',
            title: '',
            url: ''
        },
        
        //  TODO: Function is way too big
        //  Take the URL given to the dataSource and parse it for relevant information.
        //  If the URL is for a Playlist -- just get the title and set the ID. If it's a Channel,
        //  need to fetch the Channel's Uploads playlist first.
        parseUrl: function (options) {
            var url = this.get('url');
            if (url === '') throw new Error('URL expected to be set');
            
            var dataSourceId;

            //  URLs could have both video id + playlist id. Use a flag to determine whether video id is important
            if (this.get('parseVideo')) {
                dataSourceId = this._parseYouTubeSongIdFromUrl(url);

                if (dataSourceId !== '') {
                    this.set({
                        type: DataSourceType.YouTubeVideo,
                        id: dataSourceId
                    });

                    options.success();
                    return;
                }
            }

            //  Try to find a playlist id if no video id was found.
            dataSourceId = this._parseIdFromUrlWithIdentifiers(url, ['list=', 'p=']);

            if (dataSourceId !== '') {
                this.set({
                    type: DataSourceType.YouTubePlaylist,
                    id: dataSourceId
                });

                options.success();
                return;
            }

            //  Try to find channel id if still nothing found.
            dataSourceId = this._parseIdFromUrlWithIdentifiers(url, ['/user/', '/channel/']);

            if (dataSourceId !== '') {
                var channelUploadOptions = {
                    success: function(response) {

                        this.set({
                            type: DataSourceType.YouTubePlaylist,
                            id: response.uploadsPlaylistId
                        });

                        options.success();
                        return;
                    }.bind(this)
                };

                if (this._idIsUsername()) {
                    channelUploadOptions.username = dataSourceId;
                } else {
                    channelUploadOptions.channelId = dataSourceId;
                }

                YouTubeV3API.getChannelUploadsPlaylistId(channelUploadOptions);
            } else {
                //  Callback with nothing set.
                options.success();
            }
        },

        //  These dataSourceTypes require going out to a server and collecting a list of information in order to be created.
        needsLoading: function () {
            return this.get('type') === DataSourceType.YouTubePlaylist;
        },
        
        //  Expects options: { success: function, error: function }
        getTitle: function (options) {
            //  If the title has already been fetched from the URL -- return the cached one.
            if (this.get('title') !== '') {
                options.success(this.get('title'));
                return;
            }

            YouTubeV3API.getTitle({
                serviceType: YouTubeServiceType.Playlists,
                id: this.get('id'),
                success: function (title) {
                    this.set('title', title);
                    options.success(title);
                }.bind(this),
                error: options.error
            });
        },
        
        //  TODO: I'd much rather use a series of identifiers to try and parse out a video id instead of a regex.
        //  Takes a URL and returns parsed URL information such as schema and song id if found inside of the URL.
        _parseYouTubeSongIdFromUrl: function (url) {
            var songId = '';

            var match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|watch\?.*?\&v=)([^#\&\?]*).*/);
            if (match && match[2].length === 11) {
                songId = match[2];
            }

            return songId;
        },
        
        //  Find a YouTube Channel or Playlist ID by looking through the URL for the given identifier.
        _parseIdFromUrlWithIdentifiers: function (url, identifiers) {
            var id = '';
            
            _.each(identifiers, function (identifier) {
                var urlTokens = url.split(identifier);

                if (urlTokens.length > 1) {
                    id = url.split(identifier)[1];

                    var indexOfAmpersand = id.indexOf('&');
                    if (indexOfAmpersand !== -1) {
                        id = id.substring(0, indexOfAmpersand);
                    }
                }
            });

            return id;
        },
        
        _idIsUsername: function() {
            var indexOfUser = this.get('url').indexOf('/user/');
            return indexOfUser != -1;
        }
    });

    return DataSource;
});