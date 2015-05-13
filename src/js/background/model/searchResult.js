define(function(require) {
    'use strict';

    var ListItemType = require('common/enum/listItemType');

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
        }
    });

    return SearchResult;
});