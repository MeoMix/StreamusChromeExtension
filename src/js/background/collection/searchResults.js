define([
    'background/mixin/collectionMultiSelect',
    'background/model/searchResult'
], function (CollectionMultiSelect, SearchResult) {
    'use strict';
    
    var SearchResults = Backbone.Collection.extend({
        model: SearchResult,
        
        mixins: [CollectionMultiSelect],
        
        setFromSongs: function (songs) {
            var searchResults = [];

            if (songs instanceof Backbone.Collection) {
                searchResults = songs.map(function (song) {
                    return {
                        song: song
                    };
                });
            } else {
                searchResults.push({
                    song: songs
                });
            }

            this.reset(searchResults);
        },

        //  Returns the underlying Songs of the selected SearchResults.
        getSelectedSongs: function() {
            return _.map(this.selected(), function (searchResult) {
                return searchResult.get('song');
            });
        }
    });

    return SearchResults;
});