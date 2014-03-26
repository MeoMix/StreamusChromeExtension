define(function() {
    'use strict';

    var SearchResult = Backbone.Model.extend({
        defaults: function() {
            return {
                id: _.uniqueId('searchResult_'),
                selected: false,
                
                //  Whether the item was the first to be selected or one of many.
                //  Important for proper shift+click functionality.
                firstSelected: false,
                
                source: null
            };
        },
        
        //  SearchResults are never saved to the server.
        sync: function() {
            return false;
        }
    });

    return SearchResult;
});