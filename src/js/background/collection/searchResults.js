define([
    'background/mixin/collectionMultiSelect',
    'background/model/searchResult',
    'background/model/song'
], function (CollectionMultiSelect, SearchResult, Song) {
    'use strict';
    
    var SearchResults = Backbone.Collection.extend({
        model: SearchResult,
        
        mixins: [CollectionMultiSelect],
        
        setFromSongInformationList: function (songInformationList) {
            var searchResults = [];

            if (_.isArray(songInformationList)) {
                searchResults = _.map(songInformationList, function(songInformation) {
                    return {
                        song: new Song(songInformation)
                    };
                });
            } else {
                searchResults.push({
                    song: new Song(songInformationList)
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