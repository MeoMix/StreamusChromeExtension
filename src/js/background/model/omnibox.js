//  Displays streamus search suggestions and allows instant playing in the stream
define([
    'background/collection/streamItems',
    'background/model/song',
    'common/model/youTubeV3API',
    'common/model/utility'
], function (StreamItems, Song, YouTubeV3API, Utility) {
    'use strict';

    var Omnibox = Backbone.Model.extend({
        defaults: function () {
            return {
                suggestedSongs: [],
                searchJqXhr: null
            };
        },
        
        initialize: function() {
            var self = this;
            
            chrome.omnibox.setDefaultSuggestion({
                description: chrome.i18n.getMessage('pressEnterToPlay')
            });
            
            //  User has started a keyword input session by typing the extension's keyword. This is guaranteed to be sent exactly once per input session, and before any onInputChanged events.
            chrome.omnibox.onInputChanged.addListener(function (text, suggest) {
                //  Clear suggestedSongs
                self.get('suggestedSongs').length = 0;

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

                    var searchJqXhr = YouTubeV3API.search({
                        text: trimmedSearchText,
                        //  Omnibox can only show 6 results
                        maxResults: 6,
                        success: function(searchResponse) {
                            self.set('searchJqXhr', null);
                            //  TODO: Handle missing song IDs
                            var suggestions = self.buildSuggestions(searchResponse.songInformationList, trimmedSearchText);

                            suggest(suggestions);
                        }
                    });

                    self.set('searchJqXhr', searchJqXhr);
                }

            });

            chrome.omnibox.onInputEntered.addListener(function (text) {
                //  Find the cached song data by url
                var pickedSong = _.find(self.get('suggestedSongs'), function (song) {
                    return song.get('url') === text;
                });
                
                //  If the user doesn't make a selection (commonly when typing and then just hitting enter on their query)
                //  take the best suggestion related to their text.
                if (_.isUndefined(pickedSong)) {
                    pickedSong = self.get('suggestedSongs')[0];
                }

                //  TODO: Support both playOnAdd true and false
                StreamItems.addSongs(pickedSong, {
                    playOnAdd: true
                });
            });
        },
        
        buildSuggestions: function(songInformationList, text) {
            var self = this;
            
            var suggestions = _.map(songInformationList, function (songInformation) {

                var song = new Song();
                song.setYouTubeInformation(songInformation);
                
                self.get('suggestedSongs').push(song);

                var safeTitle = _.escape(song.get('title'));
                var textStyleRegExp = new RegExp(Utility.escapeRegExp(text), "i");
                var styledTitle = safeTitle.replace(textStyleRegExp, '<match>$&</match>');

                var description = '<dim>' + song.get('prettyDuration') + "</dim>  " + styledTitle;

                return {
                    content: song.get('url'),
                    description: description
                };
            });

            return suggestions;
        }
    });

    return new Omnibox();
});