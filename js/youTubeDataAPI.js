//  A global object which abstracts more difficult implementations of retrieving data from YouTube.
define([
    'levenshtein',
    'dataSource'
], function (levenshtein, DataSource) {
    'use strict';

    var videoInformationFields = 'author,title,media:group(yt:videoid,yt:duration),yt:accessControl';
    var videosInformationFields = 'entry(' + videoInformationFields + ')';
    
    //  A developer key uniquely identifies a product that is submitting an API request.
    //  https://developers.google.com/youtube/2.0/developers_guide_protocol#Developer_Key
    var developerKey = 'AI39si7voIBGFYe-bcndXXe8kex6-N_OSzM5iMuWCdPCSnZxLB_qIEnQ-HMijHrwN1Y9sFINBi_frhjzVVrYunHH8l77wfbLCA';
    
    //  Some videos aren't allowed to be played in Streamus, but we can respond by finding similiar.
    function validateEntry(entry) {
        var ytAccessControlList = entry.yt$accessControl;

        var embedAccessControl = _.find(ytAccessControlList, function (accessControl) {
            return accessControl.action === 'embed';
        });

        var isValid = embedAccessControl.permission === 'allowed';

        return isValid;
    }
    
    function tryGetIdFromUrl(url, identifier) {
        var urlTokens = url.split(identifier);

        var dataSourceId = '';

        if (urlTokens.length > 1) {
            dataSourceId = url.split(identifier)[1];
            
            var ampersandPosition = dataSourceId.indexOf('&');
            if (ampersandPosition !== -1) {
                dataSourceId = dataSourceId.substring(0, ampersandPosition);
            }
        }

        return dataSourceId;
    }
    
    return {
        
        getBulkRelatedVideoInformation: function(videoIds, callback) {

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
        
        findPlayableByTitle: function (title, callback) {

            var searchJqXhr = this.search({
                text: title,
                success: function(videoInformationList) {

                    videoInformationList.sort(function(a, b) {
                        return levenshtein(a.title.$t, title) - levenshtein(b.title.$t, title);
                    });

                    var videoInformation = videoInformationList.length > 0 ? videoInformationList[0] : null;
                    callback(videoInformation);
                }
            });

            return searchJqXhr;
        },
        
        //  When a video comes from the server it won't have its related videos, so need to fetch and populate.
        getRelatedVideoInformation: function (videoId, callback) {

            var self = this;

            //  Do an async request for the videos's related videos. There isn't a hard dependency on them existing right as a video is created.
            $.ajax({
                type: 'GET',
                url: 'https://gdata.youtube.com/feeds/api/videos/' + videoId + '/related',
                dataType: 'json',
                data: {
                    category: 'Music',
                    v: 2,
                    alt: 'json',
                    key: developerKey,
                    fields: videosInformationFields,
                    //  Don't really need that many suggested videos, take 10.
                    'max-results': 10,
                    strict: true
                },
                success: function (result) {

                    var playableEntryList = [];
                    var unplayableEntryList = [];

                    _.each(result.feed.entry, function(entry) {

                        var isValid = validateEntry(entry);

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
                error: function(error) {
                    console.error(error);
                    callback();
                }
            });
        },

        //  TODO: Combine search and quickSearch and just take a max-results paramater.
        //  Performs a search of YouTube with the provided text and returns a list of playable videos (<= max-results)
        search: function(options) {

            //  Be sure to filter out videos and suggestions which are restricted by the users geographic location.
            var searchJqXhr = $.ajax({
                type: 'GET',
                url: 'https://gdata.youtube.com/feeds/api/videos',
                dataType: 'json',
                data: {
                    category: 'Music',
                    time: 'all_time',
                    'max-results': options.maxResults || 50,
                    'start-index': 1,
                    format: 5,
                    v: 2,
                    alt: 'json',
                    q: options.text,
                    key: developerKey,
                    fields: videosInformationFields,
                    strict: true
                },
                success: function (result) {
                    options.success(result.feed.entry || []);
                },
                error: function (error) {
                
                    //  Aborts from typing too much are OK
                    if (error.statusText !== 'abort') {
                        console.error(error);
                    }
                
                }
            });

            return searchJqXhr;
        },
        
        //  Like search but limited to just one ajax request and smaller video size (used for omnibox currently)
        quickSearch: function(text, callback) {
            var quickSearchJqXhr = $.ajax({
                type: 'GET',
                url: 'https://gdata.youtube.com/feeds/api/videos',
                dataType: 'json',
                data: {
                    category: 'Music',
                    time: 'all_time',
                    'max-results': 6, // Omnibox can only show 6 results so don't both getting more.
                    'start-index': 1,
                    format: 5,
                    v: 2,
                    alt: 'json',
                    q: text,
                    key: developerKey,
                    fields: videosInformationFields,
                    strict: true
                },
                success: function (result) {
                    callback(result.feed.entry || []);
                },
                error: function (error) {
                    console.error(error);
                }
            });

            return quickSearchJqXhr;
        },
        
        //  TODO: How can I make this prettier?
        parseUrlForDataSource: function (url) {

            var dataSource = {
                id: null,
                type: DataSource.USER_INPUT
            };
            
            //  Try for PlaylistId:
            var dataSourceId = tryGetIdFromUrl(url, 'list=PL');

            if (dataSourceId !== '') {
                dataSource = {
                    id: dataSourceId,
                    type: DataSource.YOUTUBE_PLAYLIST
                };
                return dataSource;
            }
            
            //  Try for user favorite videos:
            dataSourceId = tryGetIdFromUrl(url, 'list=FL');
            
            if (dataSourceId !== '') {
                dataSource = {
                    id: dataSourceId,
                    type: DataSource.YOUTUBE_FAVORITES
                };
                return dataSource;
            }

            //  Try feed from a user URL
            dataSourceId = tryGetIdFromUrl(url, '/user/');
                
            //  Maybe they gave a channel ID instead which works same as user
            if (dataSourceId === '') {
                dataSourceId = tryGetIdFromUrl(url, '/channel/');
            }
                
            if (dataSourceId !== '') {
                dataSource = {
                    id: dataSourceId,
                    type: DataSource.YOUTUBE_CHANNEL
                };

                return dataSource;
            }
            
            dataSourceId = tryGetIdFromUrl(url, 'list=UU');

            if (dataSourceId !== '') {
                dataSource = {
                    id: dataSourceId,
                    type: DataSource.YOUTUBE_CHANNEL
                };
                return dataSource;
            }

            dataSourceId = tryGetIdFromUrl(url, 'streamus:');
                    
            if (dataSourceId !== '') {
                dataSource = {
                    id: dataSourceId,
                    type: DataSource.SHARED_PLAYLIST
                };
                return dataSource;
            }

            return dataSource;
        },
        
        getChannelName: function (channelId, callback) {
            
            $.ajax({
                type: 'GET',
                url: 'https://gdata.youtube.com/feeds/api/users/' + channelId,
                dataType: 'json',
                data: {
                    v: 2,
                    alt: 'json',
                    key: 'AI39si7voIBGFYe-bcndXXe8kex6-N_OSzM5iMuWCdPCSnZxLB_qIEnQ-HMijHrwN1Y9sFINBi_frhjzVVrYunHH8l77wfbLCA'
                },
                success: function (result) {

                    if (callback) {
                        callback(result.entry.author[0].name.$t);
                    }
                },
                error: function (error) {
                    console.error(error);

                    if (callback) {
                        callback('Error getting channel name');
                    }
                }
            });

        },
        
        getPlaylistTitle: function (playlistId, callback) {
            
            $.ajax({
                type: 'GET',
                url: "https://gdata.youtube.com/feeds/api/playlists/" + playlistId,
                dataType: 'json',
                data: {
                    v: 2,
                    alt: 'json',
                    key: developerKey,
                    fields: 'title',
                    strict: true
                },
                success: function (result) {
                    if (callback) {
                        callback(result.feed.title.$t);
                    }
                },
                error: function (error) {
                    console.error(error);
                }
            });
        },

        //  implement caching
        getVideoInformation: function (config) {
            //videoId, optionalVideoTitle, callback
            $.ajax({
                type: 'GET',
                url: 'https://gdata.youtube.com/feeds/api/videos/' + config.videoId,
                dataType: 'json',
                data: {
                    v: 2,
                    alt: 'json',
                    format: 5,
                    key: developerKey,
                    fields: videoInformationFields,
                    strict: true
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

                        var isValid = validateEntry(result.entry);
                        
                        if (isValid) {
                            config.success(result.entry);
                        } else {
                            findPlayableByTitle(result.entry.title.$t, function (playableVideoInformation) {
                                config.success(playableVideoInformation);
                            });
                        }
                        
                    }

                },
                //  This error is silently consumed and handled -- it is an OK scenario if we don't get a video... sometimes
                //  they are banned on copyright grounds. No need to log this error.
                error: function () {
                    config.error();
                }
            });
        },
        
        getDataSourceResults: function(dataSource, currentIteration, callback) {

            var url;

            switch(dataSource.type) {
            
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

            $.ajax({
                type: 'GET',
                url: url,
                dataType: 'json',
                data: {
                    v: 2,
                    alt: 'json',
                    key: developerKey,
                    'max-results': maxResultsPerSearch,
                    'start-index': startIndex,
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
                error: function (error) {
                    console.error(error);

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

        //  Fetching an auto-generated playlist requires YouTube's v3 API.
        //  The v3 API does not serve up all the necessary information with the first request.
        //  Make two requests: one to get the list of video ids and a second to get the video information
        getAutoGeneratedPlaylistData: function() {

            gapi.client.setApiKey('AIzaSyB8CsunLyyRyjgQuvcnXzFfEYnfTSMSl_o');
            gapi.client.load('youtube', 'v3', function () {
                
                var playlistItemsListRequest = gapi.client.youtube.playlistItems.list({
                    part: 'contentDetails',
                    maxResults: 50,
                    playlistId: 'ALYL4kY05133rTMhTulSaXKj_Y6el9q0JH',
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

                        var videoInformationList = _.map(videosListResponse.items, function(item) {

                            return {
                                
                                id: item.id,
                                //  TODO: Duration is currently ISO8601, need to convert to pretty.
                                duration: item.contentDetails.duration,
                                title: item.snippet.title

                            };

                        });

                    });
                });
                
            });

        }
    };
});