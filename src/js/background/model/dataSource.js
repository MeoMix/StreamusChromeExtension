define(function(require) {
    'use strict';

    var YouTubeV3API = require('background/model/youTubeV3API');
    var DataSourceType = require('common/enum/dataSourceType');
    var YouTubeServiceType = require('background/enum/youTubeServiceType');

    var DataSource = Backbone.Model.extend({
        defaults: {
            type: DataSourceType.None,
            //  Valid song ID can appear in a playlist URL so provide the ability to only pull out a playlist URL
            parseVideo: true,
            //  The songId, playlistId, channelId etc..
            entityId: '',
            title: '',
            url: ''
        },
        
        //  TODO: Function is way too big
        //  Take the URL given to the dataSource and parse it for relevant information.
        //  If the URL is for a Playlist -- just get the title and set the ID. If it's a Channel,
        //  need to fetch the Channel's Uploads playlist first.
        parseUrl: function(options) {
            var url = this.get('url');
            if (url === '') {
                throw new Error('URL expected to be set');
            }

            var entityId;

            //  URLs could have both video id + playlist id. Use a flag to determine whether video id is important
            if (this.get('parseVideo')) {
                entityId = this._parseYouTubeSongIdFromUrl(url);

                if (entityId !== '') {
                    this.set({
                        type: DataSourceType.YouTubeVideo,
                        entityId: entityId
                    });

                    options.success();
                    return;
                }
            }

            //  Try to find a playlist id if no video id was found.
            entityId = this._parseIdFromUrlWithIdentifiers(url, ['list=', 'p=']);

            if (entityId !== '') {
                this.set({
                    type: DataSourceType.YouTubePlaylist,
                    entityId: entityId
                });

                options.success();
                return;
            }

            //  Try to find channel id if still nothing found.
            entityId = this._parseIdFromUrlWithIdentifiers(url, ['/user/', '/channel/']);

            if (entityId !== '') {
                var channelUploadOptions = {
                    success: function(response) {
                        this.set({
                            type: DataSourceType.YouTubePlaylist,
                            entityId: response.uploadsPlaylistId
                        });

                        options.success();
                        return;
                    }.bind(this),
                    error: options.error
                };

                if (this._idIsUsername()) {
                    channelUploadOptions.forUsername = entityId;
                } else {
                    channelUploadOptions.id = entityId;
                }

                YouTubeV3API.getChannelUploadsPlaylistId(channelUploadOptions);
            } else {
                //  Callback with nothing set.
                options.success();
            }
        },

        getSong: function(options) {
            this.parseUrl({
                success: function() {
                    YouTubeV3API.getSong({
                        songId: this.get('entityId'),
                        success: options.success,
                        error: function() {
                            Streamus.channels.backgroundNotification.commands.trigger('show:notification', {
                                title: chrome.i18n.getMessage('failedToFindSong')
                            });

                            if (options.error) {
                                options.error();
                            }
                        }
                    });
                }.bind(this)
            });
        },

        //  These dataSourceTypes require going out to a server and collecting a list of information in order to be created.
        isYouTubePlaylist: function() {
            return this.get('type') === DataSourceType.YouTubePlaylist;
        },

        isYouTubeVideo: function() {
            return this.get('type') === DataSourceType.YouTubeVideo;
        },
        
        //  Expects options: { success: function, error: function }
        getTitle: function(options) {
            //  If the title has already been fetched from the URL -- return the cached one.
            if (this.get('title') !== '') {
                options.success(this.get('title'));
                return;
            }

            YouTubeV3API.getTitle({
                serviceType: YouTubeServiceType.Playlists,
                id: this.get('entityId'),
                success: function(title) {
                    this.set('title', title);
                    options.success(title);
                }.bind(this),
                error: options.error
            });
        },
        
        //  Takes a URL and returns parsed URL information such as schema and song id if found inside of the URL.
        _parseYouTubeSongIdFromUrl: function(url) {
            var songId = '';

            var match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|watch\?.*?\&v=)([^#\&\?]*).*/);
            if (match && match[2].length === 11) {
                songId = match[2];
            }

            return songId;
        },
        
        //  Find a YouTube Channel or Playlist ID by looking through the URL for the given identifier.
        _parseIdFromUrlWithIdentifiers: function(url, identifiers) {
            var id = '';

            _.each(identifiers, function(identifier) {
                var urlTokens = url.split(identifier);

                if (urlTokens.length > 1) {
                    id = url.split(identifier)[1];

                    var indexOfAmpersand = id.indexOf('&');
                    if (indexOfAmpersand !== -1) {
                        id = id.substring(0, indexOfAmpersand);
                    }

                    var indexOfSlash = id.indexOf('/');
                    if (indexOfSlash !== -1) {
                        id = id.substring(0, indexOfSlash);
                    }

                    var indexOfPound = id.indexOf('#');
                    if (indexOfPound !== -1) {
                        id = id.substring(0, indexOfPound);
                    }
                }
            });

            return id;
        },

        _idIsUsername: function() {
            var indexOfUser = this.get('url').indexOf('/user/');
            return indexOfUser !== -1;
        }
    });

    return DataSource;
});