//  A static object shared between the foreground and background which abstracts more difficult implementations of retrieving data from YouTube.
define([
    'dataSource',
    'utility'
], function (DataSource, Utility) {
    'use strict';
    
    //  These fields tell the YouTube API what fields to respond with to limit the amount of data going over the wire. 
    var videoInformationFields = 'author,title,media:group(yt:videoid,yt:duration),yt:accessControl';
    //  This is what to return for a list of videos instead of just a single entry.
    var videosInformationFields = 'entry(' + videoInformationFields + ')';

    var YouTubeV2API = Backbone.Model.extend({
        
        //  Crafts an AJAX request which has defaults appropriate for a YouTube V2 API request.
        //  Expects options: { url: string, data: object, success: function, error: function }
        sendV2ApiRequest: function(options) {

            return $.ajax({
                url: options.url,
                //  For a full list of data attributes see: https://developers.google.com/youtube/2.0/developers_guide_protocol_api_query_parameters
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
                    
                    //  Wait for all of the findPlayableByTitle AJAX requests to complete.
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
                    //  Developers commonly add &format=5 to their queries to restrict results to videos that can be embedded on their sites.
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

        searchPlaylist: function (options) {

            return this.sendV2ApiRequest({
                url: 'https://gdata.youtube.com/feeds/api/playlists/snippets',
                data: {
                    'max-results': options.maxResults || 50,
                    'start-index': 1,
                    q: options.text
                },
                success: function (result) {
                    options.success(result.feed.entry || []);
                }
            });
        },
        
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
                    //  Developers commonly add &format=5 to their queries to restrict results to videos that can be embedded on their sites.
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

            if (DataSource.isV3(dataSource.type)) throw "YouTubeV2 API getDataSourceResults cannot handle a V3 dataSource";

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

    return new YouTubeV2API;
});