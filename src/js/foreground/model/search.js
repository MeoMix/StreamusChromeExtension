define([
    'common/enum/dataSourceType',
    'common/model/youTubeV3API',
    'common/model/utility',
    'common/model/dataSource'
], function (DataSourceType, YouTubeV3API, Utility, DataSource) {
    'use strict';

    var SearchResults = chrome.extension.getBackgroundPage().SearchResults;
    var Settings = chrome.extension.getBackgroundPage().Settings;

    var Search = Backbone.Model.extend({
        defaults: function () {
            return {
                searchQuery: Settings.get('searchQuery'),
                doSnapAnimation: true,
                searchJqXhr: null,
                playlist: null,
                typing: false
            };
        },
        
        initialize: function () {
            var searchQuery = this.get('searchQuery');

            //  TODO: Should I not store searchQuery in Settings then? I'm not really sure why I would want to store it in localStorage.
            //  SearchResults will be empty if Streamus was restarted, but searchQuery is stored in settings (probably a bad call)
            if (searchQuery !== '' && SearchResults.length === 0) {
                this.search(searchQuery);
            }
        },
        
        saveSearchQuery: function () {
            Settings.set('searchQuery', this.get('searchQuery'));
        },

        search: function (searchQuery) {
            this.set('searchQuery', searchQuery);

            //  Do not display results if searchText was modified while searching, abort old request.
            //  Abort here and not in debounceSearch because there's no reason to continue with a search if it's not going to be relevant.
            var previousSearchJqXhr = this.get('searchJqXhr');

            if (previousSearchJqXhr) {
                previousSearchJqXhr.abort();
            }

            //  If the user provided no text to search on -- clear the search and do nothing.
            if ($.trim(searchQuery) === '') {
                SearchResults.reset();
                return;
            }
            
            //  Only set typing to true after we've checked for blank searchQuery because it won't trigger a debounceSearch which sets typing to false.
            this.set('typing', true);
            
            //  Debounce a search request so that when the user stops typing the last request will run.
            this._doDebounceSearch(searchQuery);
        },
        
        onSearchComplete: function () {
            this.set('searchJqXhr', null);
        },
        
        //  Handle the actual search functionality inside of a debounced function.
        //  This is so I can tell when the user starts typing, but not actually run the search logic until they pause.
        _doDebounceSearch: _.debounce(function (searchQuery) {
            //  If the user is just typing in whatever -- search for it, otherwise handle special data sources.
            var dataSource = new DataSource({
                url: searchQuery
            });

            dataSource.parseUrl({
                success: function () {
                    var searchJqXhr;
                    //  If the search query had a valid YouTube Video ID inside of it -- display that result, otherwise search.
                    if (dataSource.get('type') === DataSourceType.YouTubeVideo) {

                        searchJqXhr = YouTubeV3API.getSongInformation({
                            songId: dataSource.get('id'),
                            success: function (songInformation) {
                                SearchResults.setFromSongInformation(songInformation);
                            },
                            error: function (error) {
                                console.log(error);
                                //  TODO: Handle error.
                            },
                            complete: this.onSearchComplete.bind(this)
                        });
                    } else {
                        //  TODO: Handle missing song IDs
                        searchJqXhr = YouTubeV3API.search({
                            text: searchQuery,
                            success: function (searchResponse) {
                                //  Don't show old responses. Even with the xhr abort there's a point in time where the data could get through to the callback.
                                if (searchQuery === this.get('searchQuery')) {
                                    SearchResults.setFromSongInformationList(searchResponse.songInformationList);
                                }
                            }.bind(this),
                            complete: this.onSearchComplete.bind(this)
                        });

                    }

                    this.set('searchJqXhr', searchJqXhr);

                    //  Typing is false if they've paused for long enough for doSearch to run.
                    this.set('typing', false);
                }.bind(this)
            });
        }, 350)
    });

    return Search;
});