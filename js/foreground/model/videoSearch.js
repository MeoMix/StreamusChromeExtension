define([
    'videoSearchResultItems',
    'videoSearchResultItem',
    'youTubeDataAPI'
], function (VideoSearchResultItems, VideoSearchResultItem, YouTubeDataAPI) {
    'use strict';

    var VideoSearch = Backbone.Model.extend({
        
        defaults: function () {
            return {
                userInput: '',
                searchJqXhr: null,
                videoSearchResultItems: new VideoSearchResultItems,
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
                    this.get('videoSearchResultItems').reset();
                } else {

                    var searchJqXhr = YouTubeDataAPI.search({
                        text: userInput,
                        success: function(videoInformationList) {

                            //  Convert video information into search results which contain a reference to the full data incase needed later.
                            var videoSearchResultItems = _.map(videoInformationList, function(videoInformation) {

                                var videoSearchResultItem = new VideoSearchResultItem({
                                    videoInformation: videoInformation
                                });

                                return videoSearchResultItem;
                            });

                            self.get('videoSearchResultItems').reset(videoSearchResultItems);

                        }
                    });

                    this.set('searchJqXhr', searchJqXhr);
                    
                }

            });

        }

    });

    return VideoSearch;
});