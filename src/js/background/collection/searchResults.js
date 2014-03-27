define([
    'background/collection/multiSelectCollection',
    'background/model/searchResult',
    'background/model/song'
], function (MultiSelectCollection, SearchResult, Song) {
    'use strict';
    
    //  If the foreground requests, don't instantiate -- return existing from the background.
    if (!_.isUndefined(chrome.extension.getBackgroundPage().window.SearchResults)) {
        return chrome.extension.getBackgroundPage().window.SearchResults;
    }

    var SearchResults = MultiSelectCollection.extend({
        model: SearchResult,
        
        //  Call setResults with nothing to clear it, more clear public method.
        clear: function () {
            this.setResults();
        },
        
        //  Ensure resetting always calls destroy.
        setResults: function (results) {
            //  TODO: Is this still necessary with Marionette? Double-check!
            //  Destroy all existing models before resetting in order to cause the views to clean-up and prevent memory leaks.
            _.invoke(this.toArray(), 'destroy');

            this.reset(results);
        },
        
        setFromSongInformation: function (songInformation) {

            var song = new Song();
            song.setYouTubeInformation(songInformation);

            var searchResult = new SearchResult({
                song: song
            });

            this.setResults(searchResult);
        },

        setFromSongInformationList: function (songInformationList) {

            var searchResults = _.map(songInformationList, function (songInformation) {

                var song = new Song();
                song.setYouTubeInformation(songInformation);

                var searchResult = new SearchResult({
                    song: song
                });

                return searchResult;
            });

            this.setResults(searchResults);
        },
        
        getBySongId: function (songId) {
            var foundSearchResult = this.find(function(searchResult) {
                return searchResult.get('song').get('id') === songId;
            });

            return foundSearchResult;
        },
        
        //  Returns the underlying Songs of the selected SearchResults.
        getSelectedSongs: function() {
            return _.map(this.selected(), function (searchResult) {
                return searchResult.get('song');
            });
        }
        
    });

    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.SearchResults = new SearchResults();
    return window.SearchResults;
});