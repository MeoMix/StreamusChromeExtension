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
        
        //  Crafts an AJAX request which has defaults appropriate for a YouTube V2 API request.
        //  Expects options: { url: string, success: function, error: function }
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
                success: options.success,
                error: function(error) {
                    //  Manually aborted events don't need to be reported on
                    if (error.statusText !== 'abort') {
                        console.error(error);
                    }
                    
                    if (options.error) {
                        options.error(error);
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

                            self.getRelatedVideoInformation({
                                videoId: closureCurrentVideoId,
                                success: function (relatedVideoInformation) {

                                    //  getRelatedVideoInformation might error out.
                                    if (relatedVideoInformation) {

                                        bulkRelatedVideoInformation.push({
                                            videoId: closureCurrentVideoId,
                                            relatedVideoInformation: relatedVideoInformation
                                        });
                                    }

                                    videosProcessed++;
                                    videosProcessing--;
                                },
                                error: function() {
                                    //  TODO: Do something with error?
                                }
                            });

                        };

                        getRelatedVideoInfoClosure(currentVideoId);
                    }

                }

            }, 200);

        },

        //  When a video comes from the server it won't have its related videos, so need to fetch and populate.
        //  Expects options: { videoId: string, success: function, error: function }
        getRelatedVideoInformation: function (options) {

            var self = this;

            //  Do an async request for the videos's related videos. There isn't a hard dependency on them existing right as a video is created.
            return this.sendV2ApiRequest({
                url: 'https://gdata.youtube.com/feeds/api/videos/' + options.videoId + '/related',
                data: {
                    category: 'Music',
                    fields: videosInformationFields,
                    //  Don't really need that many suggested videos, take 10.
                    'max-results': 10
                },
                success: function (result) {

                    var playableEntryList = [];
                    var unplayableEntryList = [];

                    //  Sort all of the related videos returned into two piles - playable and unplayable.
                    _.each(result.feed.entry, function (entry) {

                        var isValid = self.validateEntry(entry);

                        if (isValid) {
                            playableEntryList.push(entry);
                        } else {
                            unplayableEntryList.push(entry);
                        }

                    });

                    //  For each unplayable video -- research YouTube by title and find a replacement.
                    //  Since this is an asynchronous action -- need to wait for all of the events to finish before we have a fully complete list.
                    var deferredEvents = _.map(unplayableEntryList, function (entry) {
                        return self.findPlayableByTitle({
                            title: entry.title.$t,
                            success: function(playableEntry) {
                                //  Successfully found a replacement playable video
                                playableEntryList.push(playableEntry);
                            },
                            error: function(error) {
                                console.error("There was an error find a playable entry for:" + entry.title.$t, error);
                            }
                        });
                    });
                    
                    $.when.apply($, deferredEvents).done(function () {
                        options.success(playableEntryList);
                    });

                },
                error: options.error
            });
        },

        //  Performs a search of YouTube with the provided text and returns a list of playable videos (<= max-results)
        //  Expects options: { maxResults: integer, text: string, fields: string, success: function, error: function }
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
                    options.success(result.feed.entry || []);
                },
                error: options.error
            });
        },
        
        //  Performs a search and then grabs the first item most related to the search title by calculating
        //  the levenshtein distance between all the possibilities and returning the result with the lowest distance.
        //  Expects options: { title: string, success: function, error: function }
        findPlayableByTitle: function (options) {
            
            if (!options.title || $.trim(options.title) === '') {
                if (options.error) options.error('No title provided');
                return null;
            }

            return this.search({
                text: options.title,
                success: function (videoInformationList) {

                    videoInformationList.sort(function (a, b) {
                        return Utility.getLevenshteinDistance(a.title.$t, title) - Utility.getLevenshteinDistance(b.title.$t, title);
                    });

                    var videoInformation = videoInformationList.length > 0 ? videoInformationList[0] : null;
                    options.success(videoInformation);
                },
                error: options.error
            });
        },

        //  TODO: Implement searching for playlists through the current videoSearch pane
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
        
        //  Expects options: { channelId: string, success: function, error: function };
        getChannelName: function (options) {

            return this.sendV2ApiRequest({
                url: 'https://gdata.youtube.com/feeds/api/users/' + options.channelId,
                success: function (result) {
                    options.success(result.entry.author[0].name.$t);
                },
                error: options.error
            });
        },
        
        //  Expects options: { playlistId: string, success: function, error: function };
        getPlaylistTitle: function (options) {

            return this.sendV2ApiRequest({
                url: 'https://gdata.youtube.com/feeds/api/playlists/' + options.playlistId,
                data: {
                    fields: 'title'
                },
                success: function (result) {
                    options.success(result.feed.title.$t);
                },
                error: options.error
            });
        },

        getVideoInformation: function (options) {
            var self = this;

            return this.sendV2ApiRequest({
                url: 'https://gdata.youtube.com/feeds/api/videos/' + options.videoId,
                data: {
                    format: 5,
                    fields: videoInformationFields
                },
                success: function (result) {

                    //  Result will be null if it has been banned on copyright grounds
                    if (result == null) {
                        
                        //  If the caller knew the video's title along with id -- find a replacement for the banned video
                        findPlayableByTitle({
                            title: options.videoTitle || '',
                            success: options.success,
                            error: options.error
                        });

                    } else {

                        var isValid = self.validateEntry(result.entry);

                        if (isValid) {
                            options.success(result.entry);
                        } else {
                            findPlayableByTitle({
                                title: result.entry.title.$t,
                                success: options.success,
                                error: options.error
                            });
                        }

                    }

                },
            });
        },

        //  Returns the results of a request for a segment of a channel, playlist, or other data source.
        //  CurrentIteration is an indexer to be able to grab deeper pages of a data source
        getDataSourceResults: function (dataSource, currentIteration, callback) {

            if (dataSource.type === DataSource.YOUTUBE_AUTOGENERATED) {
                //  TODO: Need to be able to pass something like currentIteration into here, but v3 API expects nextId not an index to start at.
                //this.getAutoGeneratedPlaylistData(dataSource.id, currentIteration, callback);
                console.error('not implemeneted yet');
                return null;
            }

            //  Craft an appropriate URL based off of the dataSource type and ID
            var url = 'https://gdata.youtube.com/feeds/api/';

            switch (dataSource.type) {
                case DataSource.YOUTUBE_CHANNEL:
                    url += 'users/' + dataSource.id + '/uploads';
                    break;
                case DataSource.YOUTUBE_FAVORITES:
                    url += 'users/' + dataSource.id + '/favorites';
                    break;
                case DataSource.YOUTUBE_PLAYLIST:
                    url += 'playlists/' + dataSource.id;
                    break;
                default:
                    console.error("Unhandled dataSource type:", dataSource.type);
                    return null;
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
                    //  Send back empty results on error to gracefully terminate.
                    if (callback) {
                        callback({
                            iteration: currentIteration,
                            results: []
                        });
                    }
                }
            });

        },

        //doYouTubeLogin: function () {

            //  TODO: It seems like I should be able to use chrome-identity, but I guess not.
            //chrome.identity.getAuthToken({ 'interactive': true }, function (authToken) {

            //console.log("authToken:", authToken);
            //gapi.auth.setToken(authToken);
            // }

            //gapi.auth.authorize({
            //    client_id: '346456917689-dtfdla6c18cn78u3j5subjab1kiq3jls.apps.googleusercontent.com',
            //    scope: 'https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtubepartner',
            //    //  Set immediate to false if authResult returns null
            //    immediate: true
            //}, function (authResult) {

                //if (authResult == null) {

                //} else {

                //}

            //    gapi.client.load('youtube', 'v3', function () {

            //        var request = gapi.client.youtube.subscriptions.list({
            //            mine: true,
            //            part: 'contentDetails'
            //        });

            //        request.execute(function (response) {
            //            console.log("response:", response);
            //        });
            //    });
            //});

        //},
        
        getAutoGeneratedPlaylistTitle: function (playlistId, callback) {
            
            //  The API Key is set through here: https://code.google.com/apis/console/b/0/?noredirect#project:346456917689:access 
            //  It can expire from time to time. You need to generate a new Simple API Access token with the 'Browser key' with a Referer of 'http://localhost' for testing
            //  You need to generate a browser key with your PCs IP address for chrome extension testing. Not sure how this will work for deployment though!
            //  TODO: Probably want some sort of 'if debugging -- set API key, otherwise fallback' and also probably want to remove this key during deployment?
            //gapi.client.setApiKey('AIzaSyD3_3QdKsYIQl13Jo-mBMDHr6yc2ScFBF0');
            gapi.client.setApiKey('AIzaSyCTeTdPhakrauzhWfMK9rC7Su47qdbaAGU');

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

        //  Some videos aren't allowed to be played in Streamus, but it is possible to find a replacement
        //  after detecting that the video would not be allowed.
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
});