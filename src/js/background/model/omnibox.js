//  Displays streamus search suggestions and allows instant playing in the stream
define([
    'background/collection/streamItems',
    'background/model/video',
    'common/model/youTubeV2API',
    'common/model/utility'
], function (StreamItems, Video, YouTubeV2API, Utility) {
    'use strict';

    var Omnibox = Backbone.Model.extend({
            
        defaults: function () {
            return {
                suggestedVideos: [],
                searchJqXhr: null
            };
        },
        
        initialize: function() {
            var self = this;
            
            chrome.omnibox.setDefaultSuggestion({
                //  TODO: i18n
                description: 'Press enter to play.'
            });
            
            //  User has started a keyword input session by typing the extension's keyword. This is guaranteed to be sent exactly once per input session, and before any onInputChanged events.
            chrome.omnibox.onInputChanged.addListener(function (text, suggest) {

                //  Clear suggested videos
                self.get('suggestedVideos').length = 0;

                var trimmedSearchText = $.trim(text);

                //  Clear suggestions if there is no text.
                if (trimmedSearchText === '') {
                    suggest();
                } else {
                    
                    //  Do not display results if searchText was modified while searching, abort old request.
                    var previousSearchJqXhr = self.get('searchJqXhr');

                    if (previousSearchJqXhr) {
                        previousSearchJqXhr.abort();
                        self.set('searchJqXhr', null);
                    }

                    var searchJqXhr = YouTubeV2API.search({
                        text: trimmedSearchText,
                        //  Omnibox can only show 6 results
                        maxResults: 6,
                        success: function(videoInformationList) {
                            self.set('searchJqXhr', null);

                            var suggestions = self.buildSuggestions(videoInformationList, trimmedSearchText);

                            suggest(suggestions);

                        }
                    });

                    self.set('searchJqXhr', searchJqXhr);
                }

            });

            chrome.omnibox.onInputEntered.addListener(function (text) {

                //  Find the cached video data by url
                var pickedVideo = _.find(self.get('suggestedVideos'), function(suggestedVideo) {
                    return suggestedVideo.get('url') === text;
                });
                
                //  If the user doesn't make a selection (commonly when typing and then just hitting enter on their query)
                //  take the best suggestion related to their text.
                if (pickedVideo === undefined) {
                    pickedVideo = self.get('suggestedVideos')[0];
                }

                StreamItems.addByVideo(pickedVideo, true);

            });
            
        },
        
        buildSuggestions: function(videoInformationList, text) {
            var self = this;
            
            var suggestions = _.map(videoInformationList, function (videoInformation) {

                var video = new Video({
                    videoInformation: videoInformation
                });
                self.get('suggestedVideos').push(video);

                var safeTitle = _.escape(video.get('title'));
                var textStyleRegExp = new RegExp(Utility.escapeRegExp(text), "i");
                var styledTitle = safeTitle.replace(textStyleRegExp, '<match>$&</match>');

                var description = '<dim>' + video.get('prettyDuration') + "</dim>  " + styledTitle;

                return {
                    content: video.get('url'),
                    description: description
                };
            });

            return suggestions;
        }
    });

    return new Omnibox();
});