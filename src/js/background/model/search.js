define(function(require) {
    'use strict';

    var SearchResults = require('background/collection/searchResults');
    var DataSource = require('background/model/dataSource');
    var YouTubeV3API = require('background/model/youTubeV3API');

    var Search = Backbone.Model.extend({
        defaults: function() {
            return {
                results: new SearchResults(),
                maxSearchResults: 200,
                query: '',
                searching: false,
                searchQueued: false,
                pendingRequest: null,
                clearQueryTimeout: null
            };
        },

        initialize: function() {
            this.on('change:query', this._onChangeQuery);
            this.on('change:searchQueued', this._onSearchQueued);
            this.on('change:pendingRequest', this._onChangePendingRequest);
            this.listenTo(Streamus.channels.foreground.vent, 'endUnload', this._onForegroundEndUnload.bind(this));
        },

        //  The foreground has to be able to call this whenever a view opens.
        stopClearQueryTimer: function() {
            clearTimeout(this.get('clearQueryTimeout'));
            this.set('clearQueryTimeout', null);
        },

        //  Whether anything has been typed into the query at all -- regardless of whether that is just whitespace or not.
        hasQuery: function() {
            return this.get('query') !== '';
        },

        _onChangeQuery: function() {
            this._search();
        },

        _onChangePendingRequest: function(model, pendingRequest) {
            var isSearching = this._isSearching(this.get('searchQueued'), pendingRequest);
            this.set('searching', isSearching);
        },

        _onSearchQueued: function(model, searchQueued) {
            var isSearching = this._isSearching(searchQueued, this.get('pendingRequest'));
            this.set('searching', isSearching);
        },

        _startClearQueryTimer: function() {
            //  Safe-guard against multiple setTimeouts, just incase.
            this.stopClearQueryTimer();
            this.set('clearQueryTimeout', setTimeout(this._clearQuery.bind(this), 10000));
        },
        
        //  Only search on queries which actually contain text. Different from hasQuery because want to show no search results when they type 'space'
        _hasSearchableQuery: function() {
            return this._getTrimmedQuery() !== '';
        },

        _getTrimmedQuery: function() {
            return this.get('query').trim();
        },
        
        //  Perform a search on the given query or just terminate immediately if nothing to do.
        _search: function() {
            this._clearResults();
            this._abortPendingRequest();

            if (this._hasSearchableQuery()) {
                this._startSearching();
            } else {
                //  This isn't 100% necessary, but since we know that no search is going to happen, set searchQueued to false for a snappier UI response.
                //  Rather than waiting for _doDebounceSearch to run and then do nothing.
                this.set('searchQueued', false);
            }
        },
        
        //  Set some flags indicating that a search is in progress.
        _startSearching: function() {
            this.set('searchQueued', true);
            //  Debounce a search request so that when the user stops typing the last request will run.
            this._doDebounceSearch(this._getTrimmedQuery());
        },
        
        //  Handle the actual search functionality inside of a debounced function.
        //  This is so I can tell when the user starts typing, but not actually run the search logic until they pause.
        _doDebounceSearch: _.debounce(function(trimmedQuery) {
            //  TODO: What happens between now and when parseUrl is running? It will look like no search is being performed?
            this.set('searchQueued', false);

            //  If the user typed 'a' and then hit backspace, debounce search will still be trying to run with 'a'
            //  because no future search query arrived. Prevent this.
            if (this._getTrimmedQuery() === trimmedQuery) {
                //  If the user is just typing in whatever -- search for it, otherwise handle special data sources.
                var dataSource = new DataSource({
                    url: trimmedQuery
                });

                dataSource.parseUrl({
                    success: function() {
                        this._abortPendingRequest();

                        //  If the search query had a valid YouTube Video ID inside of it -- display that result, otherwise search.
                        if (dataSource.isYouTubeVideo()) {
                            this._setResultsBySong(dataSource.get('entityId'));
                        } else if (dataSource.isYouTubePlaylist()) {
                            this._setResultsByPlaylist(dataSource.get('entityId'));
                        } else {
                            this._setResultsByText(trimmedQuery);
                        }
                    }.bind(this)
                });
            }
        }, 350),

        _setResultsBySong: function(songId) {
            var pendingRequest = YouTubeV3API.getSong({
                songId: songId,
                success: this._trySetResults.bind(this),
                error: this._onSearchError.bind(this)
            });

            this.set('pendingRequest', pendingRequest);
        },

        _setResultsByPlaylist: function(playlistId) {
            //  TODO: This is not DRY with how a Playlist loads its songs internally, how can I share the logic?
            var pendingRequest = YouTubeV3API.getPlaylistSongs({
                playlistId: playlistId,
                success: this._onGetPlaylistSongsSuccess.bind(this, playlistId),
                error: this._onSearchError.bind(this)
            });

            this.set('pendingRequest', pendingRequest);
        },

        _setResultsByText: function(trimmedQuery) {
            var pendingRequest = YouTubeV3API.search({
                text: trimmedQuery,
                success: this._onSearchSuccess.bind(this, trimmedQuery),
                error: this._onSearchError.bind(this)
            });

            this.set('pendingRequest', pendingRequest);
        },

        _onGetPlaylistSongsSuccess: function(playlistId, response) {
            this.get('results').addSongs(response.songs);

            if (!_.isUndefined(response.nextPageToken)) {
                var pendingRequest = YouTubeV3API.getPlaylistSongs({
                    playlistId: playlistId,
                    pageToken: response.nextPageToken,
                    success: this._onGetPlaylistSongsSuccess.bind(this, playlistId),
                    error: this._onSearchError.bind(this)
                });

                this.set('pendingRequest', pendingRequest);
            } else {
                this.set('pendingRequest', null);
            }
        },

        _onSearchSuccess: function(trimmedQuery, response) {
            this.get('results').addSongs(response.songs);

            var continueSearching = !_.isUndefined(response.nextPageToken) && this.get('results').length < this.get('maxSearchResults');

            if (continueSearching) {
                var pendingRequest = YouTubeV3API.search({
                    text: trimmedQuery,
                    pageToken: response.nextPageToken,
                    success: this._onSearchSuccess.bind(this, trimmedQuery),
                    error: this._onSearchError.bind(this)
                });

                this.set('pendingRequest', pendingRequest);
            } else {
                this.set('pendingRequest', null);
            }
        },
        
        //  TODO: Should I be notifying the user an error happened here?
        _onSearchError: function() {
            this.set('pendingRequest', null);
        },

        _trySetResults: function(songs) {
            this.get('results').resetSongs(songs);
            this.set('pendingRequest', null);
        },

        _clearResults: function() {
            //  Might as well not trigger excess reset events if they can be avoided.
            var results = this.get('results');

            if (results.length > 0) {
                results.reset();
            }
        },

        _abortPendingRequest: function() {
            var pendingRequest = this.get('pendingRequest');

            if (pendingRequest !== null) {
                pendingRequest.abort();
                this.set('pendingRequest', null);
            }
        },

        _clearQuery: function() {
            this.set('query', '');
        },

        _isSearching: function(searchQueued, pendingRequest) {
            return searchQueued || pendingRequest !== null;
        },

        _onForegroundEndUnload: function() {
            //  Remember search query for a bit just in case user closes and re-opens immediately.
            this._startClearQueryTimer();
        }
    });

    return Search;
});