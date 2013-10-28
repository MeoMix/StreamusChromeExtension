define([
    'videoSearchResults',
    'videoSearchResult',
    'youTubeDataAPI',
    'utility'
], function (VideoSearchResults, VideoSearchResult, YouTubeDataAPI, Utility) {
    'use strict';

    var VideoSearch = Backbone.Model.extend({
        
        defaults: function () {
            return {
                searchQuery: '',
                searchJqXhr: null,
                videoSearchResults: VideoSearchResults,
                relatedPlaylist: null
            };
        },
        
        initialize: function() {
            var self = this;
            
            //  TODO: Probably want to rate-limit this slightly.
            this.on('change:searchQuery', function (model, searchQuery) {

                //  Do not display results if searchText was modified while searching, abort old request.
                var previousSearchJqXhr = this.get('searchJqXhr');
                
                if (previousSearchJqXhr) {
                    previousSearchJqXhr.abort();
                    //  I don't want the view's loading icon to stutter on cancelling.
                    this.set('searchJqXhr', null, { silent: true });
                }

                var videoSearchResults = this.get('videoSearchResults');
                
                //  Trigger a reset when clearing the search query to get the view to redraw from 'no results' to 'type something'
                if (videoSearchResults.length > 0 || searchQuery === '') {
                    videoSearchResults.reset();
                }

                if (searchQuery !== '') {
                    
                    //  If the search query had a valid ID inside of it -- display that result, otherwise search.
                    var videoId = Utility.parseVideoIdFromUrl(searchQuery);
                    
                    if (videoId) {
                        YouTubeDataAPI.getVideoInformation({
                            videoId: videoId,
                            success: function (videoInformation) {
                                
                                //  Convert video information into search results which contain a reference to the full data incase needed later.
                                var videoSearchResult = new VideoSearchResult({
                                    videoInformation: videoInformation
                                });

                                videoSearchResults.reset(videoSearchResult);
                            },
                            error: function (error) {
                                console.error(error);
                            }
                        });
                    }
                    
                    //  TODO: Support displaying playlists and channel URLs here.
                    
                    var searchJqXhr = YouTubeDataAPI.search({
                        text: searchQuery,
                        success: function(videoInformationList) {
                            self.set('searchJqXhr', null);
                            
                            //  Convert video information into search results which contain a reference to the full data incase needed later.
                            var searchResults = _.map(videoInformationList, function(videoInformation) {

                                var videoSearchResult = new VideoSearchResult({
                                    videoInformation: videoInformation
                                });

                                return videoSearchResult;
                            });

                            videoSearchResults.reset(searchResults);
                        },
                        error: function() {
                            self.set('searchJqXhr', null);
                        }
                    });

                    this.set('searchJqXhr', searchJqXhr);
                    
                }

            });

        }

    });

    return VideoSearch;
});