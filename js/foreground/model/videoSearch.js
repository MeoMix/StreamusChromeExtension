define([
    'videoSearchResults',
    'videoSearchResult',
    'youTubeDataAPI'
], function (VideoSearchResults, VideoSearchResult, YouTubeDataAPI) {
    'use strict';

    var VideoSearch = Backbone.Model.extend({
        
        defaults: function () {
            return {
                userInput: '',
                searchJqXhr: null,
                videoSearchResults: VideoSearchResults,
                relatedPlaylist: null
            };
        },
        
        initialize: function() {
            var self = this;
            
            //  TODO: Probably want to rate-limit this slightly.
            this.on('change:userInput', function (model, userInput) {

                //  Do not display results if searchText was modified while searching, abort old request.
                var previousSearchJqXhr = this.get('searchJqXhr');
                
                if (previousSearchJqXhr) {
                    previousSearchJqXhr.abort();
                    this.set('searchJqXhr', null);
                }

                if ($.trim(userInput) === '') {
                    this.get('videoSearchResults').reset();
                } else {

                    var searchJqXhr = YouTubeDataAPI.search({
                        text: userInput,
                        success: function(videoInformationList) {

                            //  Convert video information into search results which contain a reference to the full data incase needed later.
                            var videoSearchResults = _.map(videoInformationList, function(videoInformation) {

                                var videoSearchResult = new VideoSearchResult({
                                    videoInformation: videoInformation
                                });

                                return videoSearchResult;
                            });

                            self.get('videoSearchResults').reset(videoSearchResults);

                        }
                    });

                    this.set('searchJqXhr', searchJqXhr);
                    
                }

            });

        }

    });

    return VideoSearch;
});