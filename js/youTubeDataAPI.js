//  A static object shared between the foreground and background which abstracts more difficult implementations of retrieving data from YouTube.
define([
    'dataSource',
    'utility',
    'googleApiClient'
], function (DataSource, Utility) {
    'use strict';
    
    var videoInformationFields = 'author,title,media:group(yt:videoid,yt:duration),yt:accessControl';
    var videosInformationFields = 'entry(' + videoInformationFields + ')';

    var YouTubeDataAPI = Backbone.Model.extend({
        
        sendV2ApiRequest: function(options) {

            return $.ajax({
                url: options.url,
                data: $.extend({}, options.data, {
                    //  The v parameter specifies the version of the API that YouTube should use to handle the API request.
                    v: 2,
                    //  The alt parameter specifies the format of the feed to be returned. 
                    alt: 'json',
                    //  If you want YouTube to reject API requests that contain invalid parameters, set the strict parameter value to true
                    strict: true
                }),
                //  A developer key uniquely identifies a product that is submitting an API request.
                //  https://developers.google.com/youtube/2.0/developers_guide_protocol#Developer_Key
                headers: {
                    'X-GData-Key': 'key=AI39si7voIBGFYe-bcndXXe8kex6-N_OSzM5iMuWCdPCSnZxLB_qIEnQ-HMijHrwN1Y9sFINBi_frhjzVVrYunHH8l77wfbLCA'
                },
                success: function() {
                    if (options.success) {
                        options.success(arguments[0]);
                    }
                },
                error: function(error) {
                    //  Manually aborted events don't need to be reported on
                    if (error.statusText !== 'abort') {
                        console.error(error);
                    }
                    
                    if (options.error) {
                        options.error(arguments[0]);
                    }
                    
                }
            });
        },

        //  Process a bunch of videoIds and get all of their related video information.
        //  Spawns multiple AJAX requests (up to 5) and keeps that queue full while processing.
        getBulkRelatedVideoInformation: function (videoIds, callback) {

            var bulkRelatedVideoInformation = [];
            var totalVideosToProcess = videoIds.length;
            var videosProcessed = 0;
            var videosToProcessConcurrently = 5;
            var videosProcessing = 0;

            var self = this;
            var youtubeQueryInterval = setInterval(function () {

                if (videosProcessed == totalVideosToProcess) {
                    clearInterval(youtubeQueryInterval);

                    callback(bulkRelatedVideoInformation);
                }
                    //  If there's still more videos to process...
                else if (videosProcessing + videosProcessed < totalVideosToProcess) {

                    //  Don't flood the network -- process a few at a time.
                    if (videosProcessing <= videosToProcessConcurrently) {
                        videosProcessing++;

                        var currentVideoId = videoIds.pop();

                        //  Use a closure to ensure that I iterate over the proper videoId for each async call.
                        var getRelatedVideoInfoClosure = function (closureCurrentVideoId) {

                            self.getRelatedVideoInformation(closureCurrentVideoId, function (relatedVideoInformation) {

                                //  getRelatedVideoInformation might error out.
                                if (relatedVideoInformation) {

                                    bulkRelatedVideoInformation.push({
                                        videoId: closureCurrentVideoId,
                                        relatedVideoInformation: relatedVideoInformation
                                    });
                                }

                                videosProcessed++;
                                videosProcessing--;
                            });

                        };

                        getRelatedVideoInfoClosure(currentVideoId);
                    }

                }

            }, 200);

        },

        //  When a video comes from the server it won't have its related videos, so need to fetch and populate.
        getRelatedVideoInformation: function (videoId, callback) {

            var self = this;

            //  Do an async request for the videos's related videos. There isn't a hard dependency on them existing right as a video is created.
            return this.sendV2ApiRequest({
                url: 'https://gdata.youtube.com/feeds/api/videos/' + videoId + '/related',
                data: {
                    category: 'Music',
                    fields: videosInformationFields,
                    //  Don't really need that many suggested videos, take 10.
                    'max-results': 10
                },
                success: function (result) {

                    var playableEntryList = [];
                    var unplayableEntryList = [];

                    _.each(result.feed.entry, function (entry) {

                        var isValid = self.validateEntry(entry);

                        if (isValid) {
                            playableEntryList.push(entry);
                        } else {
                            unplayableEntryList.push(entry);
                        }

                    });

                    var deferredEvents = [];

                    _.each(unplayableEntryList, function (entry) {

                        var deferred = $.Deferred(function (dfd) {

                            self.findPlayableByTitle(entry.title.$t, function (playableEntry) {
                                playableEntryList.push(playableEntry);
                                dfd.resolve();
                            });

                        }).promise();

                        deferredEvents.push(deferred);
                    });

                    $.when(deferredEvents).then(function () {

                        if (callback) {
                            callback(playableEntryList);
                        }
                    });

                },
                error: callback
            });
        },

        //  Performs a search of YouTube with the provided text and returns a list of playable videos (<= max-results)
        search: function (options) {
            
            //  TODO: When chrome.location API is stable - filter out videos and suggestions which are restricted by the users geographic location.
            return this.sendV2ApiRequest({
                url: 'https://gdata.youtube.com/feeds/api/videos',
                data: {
                    category: 'Music',
                    time: 'all_time',
                    'max-results': options.maxResults || 50,
                    'start-index': 1,
                    format: 5,
                    q: options.text,
                    fields: videosInformationFields
                },
                success: function (result) {
                    console.log("Result:", result);
                    options.success(result.feed.entry || []);
                }
            });
        },
        
        //  Performs a search and then grabs the first item most related to the search title by calculating
        //  the levenshtein distance between all the possibilities and returning the result with the lowest distance.
        findPlayableByTitle: function (title, callback) {

            return this.search({
                text: title,
                success: function (videoInformationList) {

                    videoInformationList.sort(function (a, b) {
                        return Utility.getLevenshteinDistance(a.title.$t, title) - Utility.getLevenshteinDistance(b.title.$t, title);
                    });

                    var videoInformation = videoInformationList.length > 0 ? videoInformationList[0] : null;
                    callback(videoInformation);
                }
            });
        },

        //searchPlaylist: function (options) {

        //    return this.sendV2ApiRequest({
        //        url: 'https://gdata.youtube.com/feeds/api/playlists/snippets',
        //        data: {
        //            'max-results': options.maxResults || 50,
        //            'start-index': 1,
        //            q: options.text
        //        },
        //        success: function (result) {
        //            options.success(result.feed.entry || []);
        //        }
        //    });
        //},
        
        getChannelName: function (channelId, callback) {

            return this.sendV2ApiRequest({
                url: 'https://gdata.youtube.com/feeds/api/users/' + channelId,
                success: function (result) {
                    if (callback) {
                        callback(result.entry.author[0].name.$t);
                    }
                },
                error: function() {
                    if (callback) {
                        callback('Error getting channel name');
                    }
                }
            });
        },

        getPlaylistTitle: function (playlistId, callback) {

            return this.sendV2ApiRequest({
                url: 'https://gdata.youtube.com/feeds/api/playlists/' + playlistId,
                data: {
                    fields: 'title'
                },
                success: function (result) {
                    if (callback) {
                        callback(result.feed.title.$t);
                    }
                }
            });
        },

        getVideoInformation: function (config) {
            var self = this;

            return this.sendV2ApiRequest({
                url: 'https://gdata.youtube.com/feeds/api/videos/' + config.videoId,
                data: {
                    format: 5,
                    fields: videoInformationFields
                },
                success: function (result) {

                    //  result will be null if it has been banned on copyright grounds
                    if (result == null) {

                        if (config.videoTitle && $.trim(config.videoTitle) != '') {

                            findPlayableByTitle(config.videoTitle, function (playableVideoInformation) {
                                config.callback(playableVideoInformation);
                            });
                        }

                    } else {

                        var isValid = self.validateEntry(result.entry);

                        if (isValid) {
                            config.success(result.entry);
                        } else {
                            findPlayableByTitle(result.entry.title.$t, function (playableVideoInformation) {
                                config.success(playableVideoInformation);
                            });
                        }

                    }

                },
            });
        },

        getDataSourceResults: function (dataSource, currentIteration, callback) {

            if (dataSource.type === DataSource.YOUTUBE_AUTOGENERATED) {
                //  TODO: Need to be able to pass something like currentIteration into here, but v3 API expects nextId not an index to start at.
                this.getAutoGeneratedPlaylistData(dataSource.id, currentIteration, callback);
                return;
            }

            var url;

            switch (dataSource.type) {
                case DataSource.YOUTUBE_CHANNEL:
                    url = 'https://gdata.youtube.com/feeds/api/users/' + dataSource.id + '/uploads';
                    break;
                case DataSource.YOUTUBE_PLAYLIST:
                    url = 'https://gdata.youtube.com/feeds/api/playlists/' + dataSource.id;
                    break;
                case DataSource.YOUTUBE_FAVORITES:
                    url = 'https://gdata.youtube.com/feeds/api/users/' + dataSource.id + '/favorites';
                    break;
                default:
                    console.error("Unhandled dataSource type:", dataSource.type);
                    return;
            }
            
            var maxResultsPerSearch = 50;
            var startIndex = 1 + (maxResultsPerSearch * currentIteration);

            return this.sendV2ApiRequest({
                url: url,
                data: {
                    'max-results': maxResultsPerSearch,
                    'start-index': startIndex
                },
                success: function (result) {
                        //  If the video duration has not been provided, video was deleted - skip.
                        var validResults = _.filter(result.feed.entry, function (resultEntry) {
                            return resultEntry.media$group.yt$duration !== undefined;
                        });

                        if (callback) {
                            callback({
                                iteration: currentIteration,
                                results: validResults
                            });
                        }
                },
                error: function () {

                    if (callback) {
                        callback({
                            iteration: currentIteration,
                            results: []
                        });
                    }
                }
            });

        },

        doYouTubeLogin: function () {

            //  TODO: It seems like I should be able to use chrome-identity, but I guess not.
            //chrome.identity.getAuthToken({ 'interactive': true }, function (authToken) {

            //console.log("authToken:", authToken);
            //gapi.auth.setToken(authToken);
            // }

            gapi.auth.authorize({
                client_id: '346456917689-dtfdla6c18cn78u3j5subjab1kiq3jls.apps.googleusercontent.com',
                scope: 'https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtubepartner',
                //  Set immediate to false if authResult returns null
                immediate: true
            }, function (authResult) {

                //if (authResult == null) {

                //} else {

                //}

                gapi.client.load('youtube', 'v3', function () {

                    var request = gapi.client.youtube.subscriptions.list({
                        mine: true,
                        part: 'contentDetails'
                    });

                    request.execute(function (response) {
                        console.log("response:", response);
                    });
                });
            });

        },
        
        getAutoGeneratedPlaylistTitle: function (playlistId, callback) {
            //gapi.client.setApiKey('AIzaSyD3_3QdKsYIQl13Jo-mBMDHr6yc2ScFBF0');
            gapi.client.setApiKey('AIzaSyCTeTdPhakrauzhWfMK9rC7Su47qdbaAGU');
            console.log('playlistId', playlistId);
            //  TODO: Should I be calling gapi.client.load a lot? Or just once?
            gapi.client.load('youtube', 'v3', function () {

                var playlistListRequest = gapi.client.youtube.playlists.list({
                    part: 'snippet',
                    id: playlistId,
                });

                playlistListRequest.execute(function (playlistListResponse) {
                    console.log("playlistListresponse:", playlistListResponse);
                    if (callback) {
                        var playlistTitle = playlistListResponse.items[0].snippet.title;
                        callback(playlistTitle);
                    }
                });

            });

        },

        //  Fetching an auto-generated playlist requires YouTube's v3 API.
        //  The v3 API does not serve up all the necessary information with the first request.
        //  Make two requests: one to get the list of video ids and a second to get the video information
        getAutoGeneratedPlaylistData: function (playlistId, currentIteration, callback) {

            //  The API Key is set through here: https://code.google.com/apis/console/b/0/?noredirect#project:346456917689:access 
            //  It can expire from time to time. You need to generate a new Simple API Access token with the 'Browser key' with a Referer of 'http://localhost' for testing
            //  You need to generate a browser key with your PCs IP address for chrome extension testing. Not sure how this will work for deployment though!
            //  TODO: Probably want some sort of 'if debugging -- set API key, otherwise fallback' and also probably want to remove this key during deployment?
            //gapi.client.setApiKey('AIzaSyD3_3QdKsYIQl13Jo-mBMDHr6yc2ScFBF0');
            gapi.client.setApiKey('AIzaSyCTeTdPhakrauzhWfMK9rC7Su47qdbaAGU');
            gapi.client.load('youtube', 'v3', function () {

                var playlistItemsListRequest = gapi.client.youtube.playlistItems.list({
                    part: 'contentDetails',
                    maxResults: 50,
                    playlistId: playlistId,
                });

                playlistItemsListRequest.execute(function (playlistItemsListResponse) {

                    var videoIds = _.map(playlistItemsListResponse.items, function (item) {
                        return item.contentDetails.videoId;
                    });

                    //  Now I need to take these videoIds and get their video information.
                    var videosListRequest = gapi.client.youtube.videos.list({
                        part: 'contentDetails,snippet',
                        maxResults: 50,
                        id: videoIds.join(',')
                    });

                    videosListRequest.execute(function (videosListResponse) {

                        console.log("VideosListResponse:", videosListResponse);

                        var videoInformationList = _.map(videosListResponse.items, function (item) {

                            return {

                                id: item.id,
                                duration: Utility.iso8061DurationToSeconds(item.contentDetails.duration),
                                title: item.snippet.title,
                                author: item.snippet.channelTitle

                            };

                        });

                        if (callback) {
                            callback({
                                results: videoInformationList
                            });
                        }

                    });
                });

            });

        },
        
        parseUrlForDataSource: function (url) {

            var dataSourceOptions = [{
                identifiers: ['list=PL'],
                dataSource: DataSource.YOUTUBE_PLAYLIST
            }, {
                identifiers: ['list=FL'],
                dataSource: DataSource.YOUTUBE_FAVORITES
            }, {
                identifiers: ['list=AL'],
                dataSource: DataSource.YOUTUBE_AUTOGENERATED
            }, {
                identifiers: ['/user/', '/channel', 'list=UU'],
                dataSource: DataSource.YOUTUBE_CHANNEL
            }, {
                identifiers: ['streamus:'],
                dataSource: DataSource.SHARED_PLAYLIST
            }];

            var dataSource = {
                id: null,
                type: DataSource.USER_INPUT
            };

            //  Find whichever option works.
            _.each(dataSourceOptions, function (dataSourceOption) {

                var validIdentifier = _.find(dataSourceOption.identifiers, function (identifier) {
                    var dataSourceId = tryGetIdFromUrl(url, identifier);
                    return dataSourceId !== '';
                });

                if (validIdentifier !== undefined) {
                    dataSource = {
                        id: tryGetIdFromUrl(url, validIdentifier),
                        type: dataSourceOption.dataSource
                    };
                }

            });

            return dataSource;
        },
        
        //  Some videos aren't allowed to be played in Streamus, but we can respond by finding similiar.
        validateEntry: function(entry) {
            var ytAccessControlList = entry.yt$accessControl;

            var embedAccessControl = _.find(ytAccessControlList, function (accessControl) {
                return accessControl.action === 'embed';
            });

            var isValid = embedAccessControl.permission === 'allowed';

            return isValid;
        }
    });

    return new YouTubeDataAPI;
    
    function tryGetIdFromUrl(url, identifier) {
        var urlTokens = url.split(identifier);

        var dataSourceId = '';

        if (urlTokens.length > 1) {
            dataSourceId = url.split(identifier)[1];
            
            var ampersandPosition = dataSourceId.indexOf('&');
            if (ampersandPosition !== -1) {
                dataSourceId = dataSourceId.substring(0, ampersandPosition);
            }
            
            //  Starting in v3 YouTube API wants the full identifier at the front of the dataSource.
            if (identifier === 'list=AL') {
                dataSourceId = 'AL' + dataSourceId;
            }
        }

        return dataSourceId;
    }
});