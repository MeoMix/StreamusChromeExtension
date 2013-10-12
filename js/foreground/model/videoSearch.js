define([
    'videoSearchResults',
    'videoSearchResult',
    'youTubeDataAPI'
], function (VideoSearchResults, VideoSearchResult, YouTubeDataAPI) {
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
                
                if (videoSearchResults.length > 0) {
                    videoSearchResults.reset();
                }

                if (searchQuery !== '') {
                    
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