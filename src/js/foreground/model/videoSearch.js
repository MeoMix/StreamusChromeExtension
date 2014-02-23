define([
    'background/collection/videoSearchResults',
    'background/model/settings',
    'common/enum/dataSourceType',
    'common/model/youTubeV2API',
    'common/model/utility',
    'common/model/dataSource'
], function (VideoSearchResults, Settings, DataSourceType, YouTubeV2API, Utility, DataSource) {
    'use strict';

    var VideoSearch = Backbone.Model.extend({
        
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
            //  VideoSearchResults will be empty if Streamus was restarted, but searchQuery is stored in settings (probably a bad call)
            if (searchQuery !== '' && VideoSearchResults.length === 0) {
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
                VideoSearchResults.setFromVideoInformationList([]);
                return;
            }
            
            //  Only set typing to true after we've checked for blank searchQuery because it won't trigger a debounceSearch which sets typing to false.
            this.set('typing', true);
            
            //  Debounce a search request so that when the user stops typing the last request will run.
            this.doDebounceSearch(searchQuery);
        },
        
        onSearchComplete: function () {
            this.set('searchJqXhr', null);
        },
        
        //  Handle the actual search functionality inside of a debounced function.
        //  This is so I can tell when the user starts typing, but not actually run the search logic until they pause.
        doDebounceSearch: _.debounce(function (searchQuery) {
            var self = this;

            //  If the user is just typing in whatever -- search for it, otherwise handle special data sources.
            var dataSource = new DataSource({
                urlToParse: searchQuery
            });

            var searchJqXhr;
            //  If the search query had a valid YouTube Video ID inside of it -- display that result, otherwise search.
            if (dataSource.get('type') === DataSourceType.YouTubeVideo) {

                searchJqXhr = YouTubeV2API.getVideoInformation({
                    videoId: dataSource.get('sourceId'),
                    success: function (videoInformation) {
                        VideoSearchResults.setFromVideoInformation(videoInformation);
                    },
                    complete: this.onSearchComplete.bind(this)
                });

            } else {

                searchJqXhr = YouTubeV2API.search({
                    text: searchQuery,
                    success: function (videoInformationList) {
                        //  Don't show old responses. Even with the xhr abort there's a point in time where the data could get through to the callback.
                        if (searchQuery === self.get('searchQuery')) {
                            VideoSearchResults.setFromVideoInformationList(videoInformationList);
                        }
                    },
                    complete: this.onSearchComplete.bind(this)
                });

            }

            this.set('searchJqXhr', searchJqXhr);

            //  Typing is false if they've paused for long enough for doSearch to run.
            this.set('typing', false);

            //  TODO: Support displaying playlists and channel URLs.
            //var playlistIndicator = 'playlist,';

            //var searchQueryPrefix = searchQuery.substring(0, playlistIndicator.length);

            //if (searchQueryPrefix === playlistIndicator) {

            //    searchJqXhr = YouTubeV2API.searchPlaylist({
            //        text: searchQuery.substring(playlistIndicator.length + 1),
            //        success: function (playlistInformationList) {

            //            self.set('searchJqXhr', null);
            //            videoSearchResults.setFromPlaylistInformationList(playlistInformationList);
            //        },
            //        error: function () {
            //            self.set('searchJqXhr', null);
            //        }
            //    });

            //} else {
        }, 350)

    });

    return VideoSearch;
});