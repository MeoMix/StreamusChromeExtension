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
        
        //  SearchResults are never saved to the server.
        sync: function() {
            return false;
        },
        
        initialize: function () {
            //  SearchResult title can't be edited, but useful to duplicate to keep template DRY with streamItem/playlistItem
            this.set('title', this._getSongTitle());
        },
        
        _getSongTitle: function() {
            return this.get('song').get('title');
        }
    });

    return SearchResult;
});