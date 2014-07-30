define([
    'background/collection/multiSelectCollection',
    'background/model/searchResult',
    'background/model/song'
], function (MultiSelectCollection, SearchResult, Song) {
    'use strict';
    
    var SearchResults = MultiSelectCollection.extend({
        model: SearchResult,
        
        //  TODO: I think it would be better to just condense these functions and allow either an array or a single object to be given to it.
        setFromSongInformation: function (songInformation) {
            var searchResult = new SearchResult({
                song: new Song(songInformation)
            });

            this.reset(searchResult);
        },

        setFromSongInformationList: function (songInformationList) {
            var searchResults = _.map(songInformationList, function (songInformation) {
                var searchResult = new SearchResult({
                    song: new Song(songInformation)
                });

                return searchResult;
            });

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