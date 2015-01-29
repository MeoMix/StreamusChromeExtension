define(function (require) {
    'use strict';

    var CollectionMultiSelect = require('background/mixin/collectionMultiSelect');
    var SearchResult = require('background/model/searchResult');
    
    var SearchResults = Backbone.Collection.extend({
        model: SearchResult,
        mixins: [CollectionMultiSelect],
        //  SearchResults are unable to be destroyed by 'Delete' actions because they don't exist in a mutable collection.
        isImmutable: true,
        userFriendlyName: chrome.i18n.getMessage('searchResults'),
        
        addSongs: function(songs) {
            var searchResults = this._songsAsSearchResults(songs);
            this.add(searchResults);
        },
        
        //  Reset the collection's values by mapping a single or list of Song objects into
        //  JSON objects which will be instantiated by Backbone.
        resetSongs: function (songs) {
            var searchResults = this._songsAsSearchResults(songs);
            this.reset(searchResults);
        },

        //  TODO: Maybe return non-JSON? Would that make this shorter?
        _songsAsSearchResults: function(songs) {
            var searchResults = [];

            if (songs instanceof Backbone.Collection) {
                searchResults = songs.map(function (song) {
                    return {
                        song: song,
                        title: song.get('title')
                    };
                });
            } else if (_.isArray(songs)) {
                searchResults = _.map(songs, function (song) {
                    return {
                        song: song,
                        title: song.get('title')
                    };
                });
            } else {
                searchResults.push({
                    song: songs,
                    title: songs.get('title')
                });
            }

            return searchResults;
        }
    });

    return SearchResults;
});