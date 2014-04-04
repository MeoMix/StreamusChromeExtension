define([
    'common/model/utility',
    'common/enum/dataSourceType',
    'common/googleAPI'
], function (Utility, DataSourceType, GoogleAPI) {
    'use strict';

    var YouTubeV3API = Backbone.Model.extend({

        defaults: {
            loaded: false
        },

        initialize: function () {
            this.setApiKey();

            GoogleAPI.client.load('youtube', 'v3', function () {
                this.set('loaded', true);
            }.bind(this));
        },
        
        //  Performs a search and then grabs the first item most related to the search title by calculating
        //  the levenshtein distance between all the possibilities and returning the result with the lowest distance.
        //  Expects options: { title: string, success: function, error: function }
        findPlayableByTitle: function (options) {
            return this.search({
                text: title,
                success: function (songInformationList) {

                    songInformationList.sort(function (a, b) {
                        return Utility.getLevenshteinDistance(a.title, title) - Utility.getLevenshteinDistance(b.title, title);
                    });

                    var songInformation = songInformationList.length > 0 ? songInformationList[0] : null;
                    options.success(songInformation);
                },
                error: options.error,
                complete: options.complete
            });
        },
        
        //  Performs a search of YouTube with the provided text and returns a list of playable songs (<= max-results)
        //  Expects options: { maxResults: integer, text: string, fields: string, success: function, error: function }
        search: function (options) {
            //  If the API has not loaded yet  - defer calling this event until ready.
            if (!this.get('loaded')) {
                this.once('change:loaded', function () {
                    this.search(options);
                });
                return;
            }

            var searchListRequest = GoogleAPI.client.youtube.search.list({
                part: 'id',
                //  Probably set this to its default of video/playlist/channel at some point.
                type: 'video',
                maxResults: options.maxResults || 50,
                q: $.trim(options.text),
                //topicId: '/music',
                //  I don't think it's a good idea to filter out results based on safeSearch for music.
                safeSearch: 'none'
            });

            searchListRequest.execute(function (response) {
                if (response.error) {
                    if (options.error) {
                        options.error({
                            error: response.error
                        });
                    }
                    
                    if (options.complete) {
                        options.complete();
                    }
                } else {
                    var songIds = _.map(response.items, function (item) {
                        return item.id.videoId;
                    });

                    this._getSongInformationList(songIds, function (songInformationList) {
                        options.success(songInformationList);

                        if (options.complete) {
                            options.complete();
                        }
                    });
                }

            }.bind(this));

        },
        
        //  The API Key is set through here: https://code.google.com/apis/console/b/0/?noredirect#project:346456917689:access 
        //  It can expire from time to time. You need to generate a new Simple API Access token with the 'Browser key' with a Referer of 'http://localhost' for testing
        //  You need to generate a browser key with your PCs IP address for chrome extension testing. Not sure how this will work for deployment though!
        setApiKey: function () {

            //if (Settings.get('testing')) {
            //  This key corresponds to: http://localhost
            //GoogleAPI.client.setApiKey('AIzaSyD3_3QdKsYIQl13Jo-mBMDHr6yc2ScFBF0');
            //} else {
            //  This key corresponds to: 71.93.45.93
            GoogleAPI.client.setApiKey('AIzaSyCTeTdPhakrauzhWfMK9rC7Su47qdbaAGU');
            //}
        },
        
        //  TODO: getSongInformation
        //  Converts a list of YouTube song ids into actual video information by querying YouTube with the list of ids.
        _getSongInformationList: function(songIds, callback) {
            //  Now I need to take these songIds and get their information.
            var songsListRequest = GoogleAPI.client.youtube.videos.list({
                part: 'contentDetails,snippet',
                maxResults: 50,
                id: songIds.join(',')
            });

            songsListRequest.execute(function (response) {

                var songInformationList = _.map(response.items, function (item) {

                    return {
                        id: item.id,
                        duration: Utility.iso8061DurationToSeconds(item.contentDetails.duration),
                        title: item.snippet.title,
                        author: item.snippet.channelTitle
                    };

                });

                callback(songInformationList);
            });
        },

        getAutoGeneratedPlaylistTitle: function (playlistId, callback) {

            //  If the API has not loaded yet  - defer calling this event until ready.
            if (!this.get('loaded')) {
                this.once('change:loaded', function () {
                    this.getAutoGeneratedPlaylistTitle(playlistId, callback);
                });
                return;
            }

            var playlistListRequest = GoogleAPI.client.youtube.playlists.list({
                part: 'snippet',
                id: playlistId,
            });

            playlistListRequest.execute(function (playlistListResponse) {
                if (callback) {

                    var playlistTitle = '';

                    if (playlistListResponse.items && playlistListResponse.items.length > 0) {
                        playlistTitle = playlistListResponse.items[0].snippet.title;
                    }

                    callback(playlistTitle);
                }
            });

        },
        
        getChannelUploadsPlaylistId: function (options) {
            
            //  If the API has not loaded yet  - defer calling this event until ready.
            if (!this.get('loaded')) {
                this.once('change:loaded', function () {
                    this.getChannelUploadsPlaylistId(options);
                });
                return;
            }

            var listOptions = {
                part: 'contentDetails'
            };
            
            if (!_.isUndefined(options.username)) {
                _.extend(listOptions, {
                    forUsername: options.username
                });
            }
            else if (!_.isUndefined(options.channelId)) {
                _.extend(listOptions, {
                    id: options.channelId
                });
            }

            var channelListRequest = GoogleAPI.client.youtube.channels.list(listOptions);
            
            channelListRequest.execute(function (response) {

                if (response.error) {
                    if (options.error) {
                        options.error({
                            error: response.error
                        });
                    }
                } else {

                    options.success({
                        uploadsPlaylistId: response.result.items[0].contentDetails.relatedPlaylists.uploads
                    });
                }

            });
        },

        //  Returns the results of a request for a segment of a channel, playlist, or other dataSource.
        getPlaylistItems: function (options) {
            
            //  If the API has not loaded yet  - defer calling this event until ready.
            if (!this.get('loaded')) {
                this.once('change:loaded', function () {
                    this.getPlaylistItems(options);
                });
                return;
            }

            var playlistListRequest = GoogleAPI.client.youtube.playlistItems.list({
                part: 'id',
                maxResults: 50,
                playlistId: options.playlistId,
                pageToken: options.pageToken || ''
            });
            
            playlistListRequest.execute(function (response) {

                if (response.error) {
                    if (options.error) {
                        options.error({
                            error: response.error
                        });
                    }
                } else {

                    var songIds = _.map(response.items, function (item) {
                        return item.id.videoId;
                    });

                    this._getSongInformationList(songIds, function (songInformationList) {

                        options.success({
                            nextPageToken: response.nextPageToken,
                            results: songInformationList
                        });

                    });

                }

            }.bind(this));

        },

        getRelatedSongInformation: function (options) {

            //  If the API has not loaded yet  - defer calling this event until ready.
            if (!this.get('loaded')) {
                this.once('change:loaded', function () {
                    this.getRelatedSongInformation(options);
                });
                return;
            }

            if (!this.get('loaded')) throw 'gapi youtube v3 must be loaded before calling';

            var relatedSongInformationRequest = GoogleAPI.client.youtube.search.list({
                part: 'id',
                relatedToVideoId: options.songId,
                //  Don't really need that many suggested songs, take 10.
                //  TODO: I think I actually only want 5, maybe 4, but need to play with it...
                maxResults: options.maxResults || 10,
                //  If the relatedToVideoId parameter has been supplied, type must be video.
                type: 'video'
            });

            relatedSongInformationRequest.execute(function (response) {

                if (response.error) {
                    if (options.error) {
                        options.error({
                            error: response.error
                        });
                    }
                } else {

                    var songIds = _.map(response.items, function(item) {
                        return item.id.videoId;
                    });

                    this._getSongInformationList(songIds, function(songInformationList) {
                        options.success(songInformationList);
                    });
                }

            }.bind(this));

        }

        //doYouTubeLogin: function () {

        //  TODO: It seems like I should be able to use chrome-identity, but I guess not.
        //chrome.identity.getAuthToken({ 'interactive': true }, function (authToken) {

        //GoogleAPI.auth.setToken(authToken);
        // }

        //GoogleAPI.auth.authorize({
        //    client_id: '346456917689-dtfdla6c18cn78u3j5subjab1kiq3jls.apps.googleusercontent.com',
        //    scope: 'https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtubepartner',
        //    //  Set immediate to false if authResult returns null
        //    immediate: true
        //}, function (authResult) {

        //if (authResult == null) {

        //} else {

        //}

        //    GoogleAPI.client.load('youtube', 'v3', function () {

        //        var request = GoogleAPI.client.youtube.subscriptions.list({
        //            mine: true,
        //            part: 'contentDetails'
        //        });

        //        request.execute(function (response) {
        //        });
        //    });
        //});

        //},

    });

    return new YouTubeV3API();
});