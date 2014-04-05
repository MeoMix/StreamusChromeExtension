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
                text: options.title,
                success: function (searchResponse) {
                    
                    if (searchResponse.songInformationList.length === 0) {
                        if (options.error) options.error('No playable song found after searching with title ' + options.title);
                    } else {
                        searchResponse.songInformationList.sort(function (a, b) {
                            return Utility.getLevenshteinDistance(a.title, options.title) - Utility.getLevenshteinDistance(b.title, options.title);
                        });
                        
                        options.success(searchResponse.songInformationList[0]);
                    }
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

            var request = GoogleAPI.client.youtube.search.list({
                part: 'id',
                //  Probably set this to its default of video/playlist/channel at some point.
                type: 'video',
                maxResults: options.maxResults || 50,
                q: $.trim(options.text),
                //topicId: '/music',
                //  I don't think it's a good idea to filter out results based on safeSearch for music.
                safeSearch: 'none'
            });

            this._executeRequest({
                request: request,
                success: function(response) {
                    var songIds = _.map(response.items, function(item) {
                        return item.id.videoId;
                    });

                    this.getSongInformationList({
                        songIds: songIds,
                        //  TODO: Update this for getSongInformationlist
                        success: options.success,
                        error: options.error,
                        complete: options.complete
                    });
                }.bind(this),
                error: function(error) {
                    if (options.error) options.error(error);
                    if (options.complete) options.complete();
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

            var request = GoogleAPI.client.youtube.channels.list(listOptions);

            this._executeRequest({
                request: request,
                success: function(response) {
                    options.success({
                        uploadsPlaylistId: response.result.items[0].contentDetails.relatedPlaylists.uploads
                    });
                    
                    if (options.complete) options.complete();
                },
                error: function(error) {
                    if (options.error) options.error(error);
                    if (options.complete) options.complete();
                }
            });
        },
        
        //  TODO: Make DRYer with getSongInformationList
        getSongInformation: function (options) {

            //  If the API has not loaded yet  - defer calling this event until ready.
            if (!this.get('loaded')) {
                this.once('change:loaded', function () {
                    this.getSongInformation(options);
                });
                return;
            }
            
            this.getSongInformationList({
                songIds: [options.songId],
                success: function (response) {
                    options.success(response.songInformationList[0]);
                },
                error: options.error,
                complete: options.complete
            });
        },

        //  Returns the results of a request for a segment of a channel, playlist, or other dataSource.
        getPlaylistSongInformationList: function (options) {
            
            //  If the API has not loaded yet  - defer calling this event until ready.
            if (!this.get('loaded')) {
                this.once('change:loaded', function () {
                    this.getPlaylistSongInformationList(options);
                });
                return;
            }

            var request = GoogleAPI.client.youtube.playlistItems.list({
                part: 'contentDetails',
                maxResults: 50,
                playlistId: options.playlistId,
                pageToken: options.pageToken || ''
            });

            this._executeRequest({
                request: request,
                success: function(response) {
                    var songIds = _.map(response.items, function (item) {
                        return item.contentDetails.videoId;
                    });

                    this.getSongInformationList({
                        songIds: songIds,
                        success: function (songInformationListResponse) {
                            options.success(_.extend({
                                nextPageToken: response.nextPageToken,
                            }, songInformationListResponse));
                        },
                        error: options.error,
                        complete: options.complete
                    });
                }.bind(this),
                error: function(error) {
                    if (options.error) options.error(error);
                    if (options.complete) options.complete();
                }
            });
 
        },

        getRelatedSongInformationList: function (options) {

            //  If the API has not loaded yet  - defer calling this event until ready.
            if (!this.get('loaded')) {
                this.once('change:loaded', function () {
                    this.getRelatedSongInformationList(options);
                });
                return;
            }

            var request = GoogleAPI.client.youtube.search.list({
                part: 'id',
                relatedToVideoId: options.songId,
                //  Don't really need that many suggested songs, take 10.
                //  TODO: I think I actually only want 5, maybe 4, but need to play with it...
                maxResults: options.maxResults || 10,
                //  If the relatedToVideoId parameter has been supplied, type must be video.
                type: 'video'
            });

            this._executeRequest({
                request: request,
                success: function(response) {
                    var songIds = _.map(response.items, function (item) {
                        return item.id.videoId;
                    });

                    this.getSongInformationList({
                        songIds: songIds,
                        success: function (songInformationListResponse) {
                            //  OK to drop missingSongIds; not expecting any because YouTube determines related song ids.
                            options.success(songInformationListResponse.songInformationList);
                        },
                        error: options.error,
                        complete: options.complete
                    });
                }.bind(this),
                error: function(error) {
                    if (options.error) options.error(error);
                    if (options.complete) options.complete();
                }
            });
        },
        
        //  Converts a list of YouTube song ids into actual video information by querying YouTube with the list of ids.
        getSongInformationList: function (options) {
            
            //  If the API has not loaded yet  - defer calling this event until ready.
            if (!this.get('loaded')) {
                this.once('change:loaded', function () {
                    this.getSongInformationList(options);
                });
                return;
            }

            //  Now I need to take these songIds and get their information.
            var request = GoogleAPI.client.youtube.videos.list({
                part: 'contentDetails,snippet',
                maxResults: 50,
                id: options.songIds.join(',')
            });

            this._executeRequest({
                request: request,
                success: function (response) {

                    //  TODO: Not sure how I feel about calling error here instead of success with all missing song IDs provided.
                    if (_.isUndefined(response.items)) {
                        if (options.error) options.error('The response\'s item list was undefined. Song(s) may have been banned.');
                    } else {
                        var songInformationList = _.map(response.items, function (item) {

                            return {
                                id: item.id,
                                duration: Utility.iso8061DurationToSeconds(item.contentDetails.duration),
                                title: item.snippet.title,
                                author: item.snippet.channelTitle
                            };

                        });

                        var missingSongIds = _.difference(options.songIds, _.pluck(songInformationList, 'id'));

                        options.success({
                            songInformationList: songInformationList,
                            missingSongIds: missingSongIds
                        });
                    }

                    if (options.complete) options.complete();
                },
                error: function(error) {
                    if (options.error) options.error(error);
                    if (options.complete) options.complete();
                }
            });
        },
        
        //  Expects options: { channelId: string, success: function, error: function };
        getChannelTitle: function (options) {
            
            //  If the API has not loaded yet  - defer calling this event until ready.
            if (!this.get('loaded')) {
                this.once('change:loaded', function () {
                    this.getChannelTitle(options);
                });
                return;
            }

            //  Now I need to take these songIds and get their information.
            var request = GoogleAPI.client.youtube.channels.list({
                part: 'snippet',
                id: options.channelId,
                fields: 'items/snippet/title'
            });

            this._executeRequest({
                request: request,
                success: function (response) {
                    console.log("response:", response);
                    options.success(response.items[0].snippet.title);
                    if (options.complete) options.complete();
                },
                error: function (error) {
                    if (options.error) options.error(error);
                    if (options.complete) options.complete();
                }
            });
        },
        
        //  Expects options: { playlistId: string, success: function, error: function };
        getPlaylistTitle: function (options) {
            
            //  If the API has not loaded yet  - defer calling this event until ready.
            if (!this.get('loaded')) {
                this.once('change:loaded', function () {
                    this.getPlaylistTitle(options);
                });
                return;
            }

            var request = GoogleAPI.client.youtube.playlists.list({
                part: 'snippet',
                id: options.playlistId,
                fields: 'items/snippet/title'
            });

            this._executeRequest({
                request: request,
                success: function (response) {
                    options.success(response.items[0].snippet.title);
                    if (options.complete) options.complete();
                },
                error: function (error) {
                    if (options.error) options.error(error);
                    if (options.complete) options.complete();
                }
            });
        },
        
        //  TODO: I'd like to use this to keep things more DRY, but not sure how to make error/success/complete interactions work properly.
        _executeRequest: function (options) {
            options.request.execute(function (response) {
                if (response.error) {
                    options.error(response.error);
                } else {
                    options.success(response);
                }
            });
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