define([
    'common/enum/dataSourceType',
    'common/model/youTubeV3API'
], function (DataSourceType, YouTubeV3API) {
    'use strict';

    var DataSource = Backbone.Model.extend({

        defaults: {
            type: DataSourceType.None,
            //  Valid song ID can appear in a playlist URL so provide the ability to only pull out a playlist URL
            parseVideo: true,
            //  The songId, playlistId, channelId etc..
            id: '',
            title: '',
            rawUrl: ''
        },

        initialize: function (options) {

            if (options && options.urlToParse) {
                var parsedDataSourceInformation = this.parseUrlForDataSourceInformation(options.urlToParse);
                this.set('type', parsedDataSourceInformation.dataSourceType);
                this.set('id', parsedDataSourceInformation.dataSourceId);

                delete options.urlToParse;
            }

        },

        //  These dataSourceTypes require going out to a server and collecting a list of information in order to be created.
        needsLoading: function () {
            var type = this.get('type');

            return type === DataSourceType.YouTubeChannel || type === DataSourceType.YouTubePlaylist;
        },

        parseUrlForDataSourceInformation: function (urlToParse) {

            this.set('rawUrl', urlToParse);

            var dataSourceType = DataSourceType.None;
            var dataSourceId = '';
            
            if (this.get('parseVideo')) {
                //  Start by trying to parse by id because it should take priority over a playlist ID.
                var songId = this.parseYouTubeSongIdFromUrl(urlToParse);

                if (songId) {
                    dataSourceId = songId;
                    dataSourceType = DataSourceType.YouTubeVideo;
                }
            }
            
            //  If a song wasn't successfully parsed -- try lots of other combinations.
            //  Eventually give up if nothing found and assume raw text.
            if (dataSourceType === DataSourceType.None) {

                var dataSourceOptions = [{
                    identifiers: ['list=PL', 'p=PL', 'list=RD', 'p=RD', 'list=FL', 'p=FL', 'list=AL', 'p=AL'],
                    dataSourceType: DataSourceType.YouTubePlaylist
                }, { //  TODO: list=uu being a channel seems weird.. its probably user uploads? i guess that's kind of a channel.. but really its a Playlist I think.
                    identifiers: ['/user/', '/channel/', 'list=UU', 'p=UU'],
                    dataSourceType: DataSourceType.YouTubeChannel
                }, {
                    identifiers: ['streamus:'],
                    dataSourceType: DataSourceType.SharedPlaylist
                }];

                var tryGetIdFromUrl = function (url, identifier) {
                    var urlTokens = url.split(identifier);

                    var parsedDataSourceId = '';

                    if (urlTokens.length > 1) {
                        parsedDataSourceId = url.split(identifier)[1];

                        var ampersandPosition = parsedDataSourceId.indexOf('&');
                        if (ampersandPosition !== -1) {
                            parsedDataSourceId = parsedDataSourceId.substring(0, ampersandPosition);
                        }
                        
                        //  TODO: How could I express this logic more simply? Also, is it messing up on UU?
                        switch(identifier) {
                            case 'list=AL':
                            case 'p=AL':
                                parsedDataSourceId = 'AL' + parsedDataSourceId;
                                break;
                            case 'list=RD':
                            case 'p=RD':
                                parsedDataSourceId = 'RD' + parsedDataSourceId;
                                break;
                            case 'list=FL':
                            case 'p=FL':
                                parsedDataSourceId = 'FL' + parsedDataSourceId;
                                break;
                        }
                    }

                    return parsedDataSourceId;
                };

                //  Find whichever option works.
                _.each(dataSourceOptions, function (dataSourceOption) {

                    var validIdentifier = _.find(dataSourceOption.identifiers, function (identifier) {
                        var parsedDataSourceId = tryGetIdFromUrl(urlToParse, identifier);
                        return parsedDataSourceId !== '';
                    });

                    if (validIdentifier !== undefined) {
                        dataSourceId = tryGetIdFromUrl(urlToParse, validIdentifier);
                        dataSourceType = dataSourceOption.dataSourceType;
                    }

                });
                
            }

            return {
                dataSourceType: dataSourceType,
                dataSourceId: dataSourceId
            };
        },

        //  Takes a URL and returns parsed URL information such as schema and song id if found inside of the URL.
        parseYouTubeSongIdFromUrl: function (url) {
            var songId = null;

            var match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|watch\?.*?\&v=)([^#\&\?]*).*/);
            if (match && match[2].length === 11) {
                songId = match[2];
            }

            return songId;
        },

        //  Expects options: { success: function, error: function }
        getTitle: function (options) {
            //  Support calling without paramaters just in case.
            options = $.extend({}, {
                success: function () { },
                error: function () { },
                //  Allow for console.error stifling
                notifyOnError: true
            }, options);

            //  If the title has already been fetched from the URL -- return the cached one.
            if (this.get('title') !== '') {
                options.success(this.get('title'));
                return;
            }

            var self = this;
            switch (this.get('type')) {
                case DataSourceType.YouTubePlaylist:

                    YouTubeV3API.getPlaylistTitle({
                        playlistId: this.get('id'),
                        success: function (title) {
                            self.set('title', title);
                            options.success(title);
                        },
                        error: options.error
                    });

                    break;
                case DataSourceType.YouTubeChannel:

                    YouTubeV3API.getChannelTitle({
                        channelId: this.get('id'),
                        success: function (title) {
                            self.set('title', title);
                            options.success(title);
                        },
                        error: options.error
                    });

                    break;
                    //  TODO: Need to support getting shared playlist information.
                    //case DataSource.SHARED_PLAYLIST:
                    //    self.model.addPlaylistByDataSource('', dataSource);
                    //    break;
                default:
                    if (options.notifyOnError) {
                        console.error("Unhandled dataSource type:", this.get('type'));
                    }

                    options.error();
            }
        },
        
        idIsUsername: function() {
            var indexOfUser = this.get('rawUrl').indexOf('/user/');
            return indexOfUser != -1;
        }

    });

    return DataSource;
});