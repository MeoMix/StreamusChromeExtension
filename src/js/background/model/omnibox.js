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
            chrome.omnibox.setDefaultSuggestion({
                description: chrome.i18n.getMessage('pressEnterToPlay')
            });
            
            //  User has started a keyword input session by typing the extension's keyword. This is guaranteed to be sent exactly once per input session, and before any onInputChanged events.
            chrome.omnibox.onInputChanged.addListener(this._onInputChanged.bind(this));
            chrome.omnibox.onInputEntered.addListener(this._onInputEntered.bind(this));
        },
        
        _onInputChanged: function (text, suggest) {
            //  Clear suggestedSongs
            this.get('suggestedSongs').length = 0;

            var trimmedSearchText = $.trim(text);

            //  Clear suggestions if there is no text.
            if (trimmedSearchText === '') {
                suggest([]);
            } else {
                //  Do not display results if searchText was modified while searching, abort old request.
                var previousSearchJqXhr = this.get('searchJqXhr');

                if (previousSearchJqXhr) {
                    previousSearchJqXhr.abort();
                    this.set('searchJqXhr', null);
                }

                var searchJqXhr = YouTubeV3API.search({
                    text: trimmedSearchText,
                    //  Omnibox can only show 6 results
                    maxResults: 6,
                    //  TODO: Reduce nesting
                    success: function(searchResponse) {
                        this.set('searchJqXhr', null);
                        //  TODO: Handle missing song IDs
                        var suggestions = this.buildSuggestions(searchResponse.songInformationList, trimmedSearchText);

                        suggest(suggestions);
                    }.bind(this)
                });

                this.set('searchJqXhr', searchJqXhr);
            }
        },
        
        _onInputEntered: function(text) {
            //  Find the cached song data by url
            var pickedSong = _.find(this.get('suggestedSongs'), function (song) {
                return song.get('url') === text;
            });
                
            //  If the user doesn't make a selection (commonly when typing and then just hitting enter on their query)
            //  take the best suggestion related to their text.
            if (_.isUndefined(pickedSong)) {
                pickedSong = this.get('suggestedSongs')[0];
            }

            //  TODO: Support both playOnAdd true and false
            StreamItems.addSongs(pickedSong, {
                playOnAdd: true
            });
        },
        
        buildSuggestions: function(songInformationList, text) {
            var suggestions = _.map(songInformationList, function (songInformation) {
                var song = new Song();
                song.setYouTubeInformation(songInformation);
                
                this.get('suggestedSongs').push(song);

                var safeTitle = _.escape(song.get('title'));
                var textStyleRegExp = new RegExp(Utility.escapeRegExp(text), "i");
                var styledTitle = safeTitle.replace(textStyleRegExp, '<match>$&</match>');

                var description = '<dim>' + song.get('prettyDuration') + "</dim>  " + styledTitle;

                return {
                    content: song.get('url'),
                    description: description
                };
            }, this);

            return suggestions;
        }
    });

    return new Omnibox();
});