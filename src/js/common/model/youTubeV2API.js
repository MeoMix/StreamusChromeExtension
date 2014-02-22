//  A static object shared between the foreground and background which abstracts more difficult implementations of retrieving data from YouTube.
define([
    'common/enum/dataSourceType',
    'common/model/utility'
], function (DataSourceType, Utility) {
    'use strict';

    var YouTubeV2API = Backbone.Model.extend({
        
        defaults: function () {

            var videoInformationFields = 'author,title,media:group(yt:videoid,yt:duration),yt:accessControl,yt:hd';

            return {
                //  These fields tell the YouTube API what fields to respond with to limit the amount of data going over the wire. 
                videoInformationFields: videoInformationFields,
                //  This is what to return for a list of videos instead of just a single entry.
                videoListInformationFields: 'entry(' + videoInformationFields + ')'
            };
        },

        //  Crafts an AJAX request which has defaults appropriate for a YouTube V2 API request.
        //  Expects options: { url: string, data: object, success: function, error: function }
        sendV2ApiRequest: function (options) {

            if ($.trim(options.url) === '') {
                console.error("URL expected");

                if (options.error) {
                    options.error('URL expected');
                }

                if (options.complete) {
                    options.complete();
                }
            }

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
                success: function () {
                    options.success(arguments[0]);

                    if (options.complete) {
                        options.complete();
                    }
                },
                error: function (error) {
                    //  Manually aborted events don't need to be reported on
                    if (error.statusText !== 'abort') {
                        console.error(error.statusText);
                    }

                    if (options.error) {
                        options.error(error);
                    }

                    if (options.complete) {
                        options.complete();
                    }
                }
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
                    fields: this.get('videoListInformationFields')
                },
                success: function (result) {
                    options.success(result.feed.entry || []);
                },
                error: options.error,
                complete: options.complete
            });
        },

        //  Performs a search and then grabs the first item most related to the search title by calculating
        //  the levenshtein distance between all the possibilities and returning the result with the lowest distance.
        //  Expects options: { title: string, success: function, error: function }
        findPlayableByTitle: function (options) {

            var title = $.trim(options.title || '');

            if (title === '') {
                if (options.error) options.error('No title provided');
                return null;
            }

            return this.search({
                text: title,
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

            return this.sendV2ApiRequest({
                url: 'https://gdata.youtube.com/feeds/api/videos/' + options.videoId,
                data: {
                    //  Developers commonly add &format=5 to their queries to restrict results to videos that can be embedded on their sites.
                    format: 5,
                    fields: this.get('videoInformationFields')
                },
                success: function (result) {
                    var isValid = this.validateEntry(result.entry);

                    if (isValid) {
                        options.success(result.entry);
                    } else {
                        this.findPlayableByTitle({
                            title: result.entry.title.$t,
                            success: options.success,
                            error: options.error
                        });
                    }

                }.bind(this),
                error: function () {
                    //  If the caller knew the video's title along with id -- find a replacement for the banned video
                    this.findPlayableByTitle({
                        title: options.videoTitle,
                        success: options.success,
                        error: options.error
                    });
                }.bind(this),
                complete: options.complete
            });
        },

        //  Returns the results of a request for a segment of a channel, playlist, or other data source.
        //  CurrentIteration is an indexer to be able to grab deeper pages of a data source
        getDataSourceResults: function (dataSource, currentIteration, callback) {

            if (dataSource.isV3()) throw "YouTubeV2 API getDataSourceResults cannot handle a V3 dataSource";

            var maxResultsPerSearch = 50;
            var startIndex = 1 + (maxResultsPerSearch * currentIteration);

            return this.sendV2ApiRequest({
                url: dataSource.get('url'),
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

        //  TODO: I only call this in one spot, but I feel like it could be useful elsewhere?
        //  Some videos aren't allowed to be played in Streamus, but it is possible to find a replacement
        //  after detecting that the video would not be allowed.
        validateEntry: function (entry) {
            var ytAccessControlList = entry.yt$accessControl;

            var embedAccessControl = _.find(ytAccessControlList, function (accessControl) {
                return accessControl.action === 'embed';
            });

            var isValid = embedAccessControl.permission === 'allowed';

            return isValid;
        }
    });

    return new YouTubeV2API();
});