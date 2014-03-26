define([
    'background/collection/multiSelectCollection',
    'background/model/searchResult',
    'background/model/source'
], function (MultiSelectCollection, SearchResult, Source) {
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
        
        setFromVideoInformation: function (videoInformation) {

            var source = new Source();
            source.setYouTubeVideoInformation(videoInformation);

            //  Convert video information into search results which contain a reference to the full data incase needed later.
            var searchResult = new SearchResult({
                source: source
            });

            this.setResults(searchResult);
        },

        setFromVideoInformationList: function (videoInformationList) {
            //  Convert video information into search results which contain a reference to the full data incase needed later.
            var searchResults = _.map(videoInformationList, function (videoInformation) {

                var source = new Source();
                source.setYouTubeVideoInformation(videoInformation);

                var searchResult = new SearchResult({
                    source: source
                });

                return searchResult;
            });

            this.setResults(searchResults);
        },
        
        getBySourceId: function (sourceId) {
            var foundSearchResult = this.find(function(searchResult) {
                return searchResult.get('source').get('id') === sourceId;
            });

            return foundSearchResult;
        },
        
        //  Returns the underlying Sources of the selected SearchResults.
        getSelectedSources: function() {
            return _.map(this.selected(), function (searchResult) {
                return searchResult.get('source');
            });
        }
        
    });

    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.SearchResults = new SearchResults();
    return window.SearchResults;
});