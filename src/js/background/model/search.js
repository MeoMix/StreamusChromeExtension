define([
    'background/collection/searchResults',
    'background/model/dataSource',
    'background/model/youTubeV3API'
], function (SearchResults, DataSource, YouTubeV3API) {
    'use strict';

    var Search = Backbone.Model.extend({
        defaults: function () {
            return {
                //  TODO: Still feeling like this should be 'items'
                results: new SearchResults(),
                maxSearchResults: 200,
                query: '',
                searching: false,
                debounceSearchQueued: false,
                pendingRequests: 0,
                clearQueryTimeout: null
            };
        },
        
        initialize: function () {
            this.on('change:query', this._onChangeQuery);
            this.listenTo(Streamus.channels.foreground.vent, 'endUnload', this._onForegroundEndUnload.bind(this));
        },

        //  The foreground has to be able to call this whenever a view opens.
        stopClearQueryTimer: function () {
            window.clearTimeout(this.get('clearQueryTimeout'));
            this.set('clearQueryTimeout', null);
        },

        //  Whether anything has been typed into the query at all -- regardless of whether that is just whitespace or not.
        hasQuery: function() {
            return this.get('query') !== '';
        },
        
        _onChangeQuery: function () {
            this._search();
        },
        
        _startClearQueryTimer: function () {
            //  Safe-guard against multiple setTimeouts, just incase.
            this.stopClearQueryTimer();
            this.set('clearQueryTimeout', setTimeout(this._clearQuery.bind(this), 10000));
        },
        
        //  Only search on queries which actually contain text. Different from hasQuery because want to show no search results when they type 'space'
        _hasSearchableQuery: function () {
            return this._getTrimmedQuery() !== '';
        },
        
        _getTrimmedQuery: function () {
            return this.get('query').trim();
        },
        
        //  Perform a search on the given query or just terminate immediately if nothing to do.
        _search: function () {
            this._clearResults();

            if (this._hasSearchableQuery()) {
                this._startSearching();
            } else {
                this.set('searching', false);
            }
        },
        
        //  Set some flags indicating that a search is in progress.
        _startSearching: function () {
            this.set('searching', true);
            this.set('debounceSearchQueued', true);
            //  Debounce a search request so that when the user stops typing the last request will run.
            this._doDebounceSearch(this._getTrimmedQuery());
        },
        
        //  Handle the actual search functionality inside of a debounced function.
        //  This is so I can tell when the user starts typing, but not actually run the search logic until they pause.
        _doDebounceSearch: _.debounce(function (trimmedQuery) {
            this.set('debounceSearchQueued', false);

            //  If the user is just typing in whatever -- search for it, otherwise handle special data sources.
            var dataSource = new DataSource({
                url: trimmedQuery
            });

            dataSource.parseUrl({
                success: function () {
                    this.set('pendingRequests', this.get('pendingRequests') + 1);

                    //  If the search query had a valid YouTube Video ID inside of it -- display that result, otherwise search.
                    if (dataSource.isYouTubeVideo()) {
                        this._setResultsBySong(dataSource.get('id'), trimmedQuery);
                    } else if (dataSource.isYouTubePlaylist()) {
                        this._setResultsByPlaylist(dataSource.get('id'), trimmedQuery);
                    } else{
                        this._setResultsByText(trimmedQuery);
                    }
                }.bind(this)
            });
        }, 350),
        
        _setResultsBySong: function (songId, trimmedQuery) {
            YouTubeV3API.getSong({
                songId: songId,
                success: this._trySetResults.bind(this, trimmedQuery),
                complete: this._onSearchComplete.bind(this)
            });
        },
        
        _setResultsByPlaylist: function (playlistId, trimmedQuery) {
            //  TODO: This is not DRY with how a Playlist loads its songs internally, how can I share the logic?
            YouTubeV3API.getPlaylistSongs({
                playlistId: playlistId,
                success: this._onGetPlaylistSongsSuccess.bind(this, trimmedQuery, playlistId),
                complete: this._onSearchComplete.bind(this)
            });
        },
        
        _setResultsByText: function (trimmedQuery) {
            YouTubeV3API.search({
                text: trimmedQuery,
                success: this._onSearchSuccess.bind(this, trimmedQuery),
                complete: this._onSearchComplete.bind(this)
            });
        },
        
        _onSearchComplete: function () {
            this.set('pendingRequests', this.get('pendingRequests') - 1);

            if (!this._hasSearchPending()) {
                this.set('searching', false);
            }
        },
        
        _onGetPlaylistSongsSuccess: function(trimmedQuery, playlistId, response) {
            //  Don't show old responses. Even with xhr.abort() there's a point in time where the data could get through to the callback.
            if (trimmedQuery === this._getTrimmedQuery()) {
                this.get('results').addSongs(response.songs);

                if (!_.isUndefined(response.nextPageToken)) {
                    this.set('pendingRequests', this.get('pendingRequests') + 1);
                    
                    YouTubeV3API.getPlaylistSongs({
                        playlistId: playlistId,
                        pageToken: response.nextPageToken,
                        success: this._onGetPlaylistSongsSuccess.bind(this, trimmedQuery, playlistId),
                        complete: this._onSearchComplete.bind(this)
                    });
                }
            }
        },
        
        _onSearchSuccess: function (trimmedQuery, response) {
            //  Don't show old responses. Even with xhr.abort() there's a point in time where the data could get through to the callback.
            if (trimmedQuery === this._getTrimmedQuery()) {
                this.get('results').addSongs(response.songs);

                if (!_.isUndefined(response.nextPageToken) && this.get('results').length < this.get('maxSearchResults')) {
                    this.set('pendingRequests', this.get('pendingRequests') + 1);

                    YouTubeV3API.search({
                        text: trimmedQuery,
                        pageToken: response.nextPageToken,
                        success: this._onSearchSuccess.bind(this, trimmedQuery),
                        complete: this._onSearchComplete.bind(this)
                    });
                }
            }
        },
        
        _trySetResults: function (trimmedQuery, songs) {
            //  Don't show old responses. Even with xhr.abort() there's a point in time where the data could get through to the callback.
            if (trimmedQuery === this._getTrimmedQuery()) {
                this.get('results').resetSongs(songs);
            }
        },
        
        _clearResults: function () {
            //  Might as well not trigger excess reset events if they can be avoided.
            var results = this.get('results');            
            if (results.length > 0) {
                results.reset();
            }
        },
        
        _clearQuery: function () {
            this.set('query', '');
        },
        
        _hasSearchPending: function() {
            return this.get('debounceSearchQueued') || this.get('pendingRequests') !== 0;
        },
        
        _onForegroundEndUnload: function() {
            //  Remember search query for a bit just in case user closes and re-opens immediately.
            this._startClearQueryTimer();
        }
    });

    return Search;
});