define([
    'common/enum/listItemType'
], function (ListItemType) {
    'use strict';

    var SearchResult = Backbone.Model.extend({
        defaults: function() {
            return {
                id: _.uniqueId('searchResult_'),
                selected: false,
                title: '',
                //  Whether the item was the first to be selected or one of many.
                //  Important for proper shift+click functionality.
                firstSelected: false,
                listItemType: ListItemType.SearchResult,
                song: null
            };
        },
        //  TODO: Why is this needed?
        //  SearchResults are never saved to the server.
        sync: function() {
            return false;
        }
    });

    return SearchResult;
});