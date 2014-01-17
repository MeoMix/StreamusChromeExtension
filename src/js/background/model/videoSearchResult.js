define(function() {
    'use strict';

    var VideoSearchResult = Backbone.Model.extend({
        defaults: function() {
            return {
                id: _.uniqueId('videoSearchResult_'),
                selected: false,
                //  Whether the item was the first to be selected or one of many.
                //  Important for proper shift+click functionality.
                firstSelected: false,

                //  Store the whole video for saving later
                video: null
            };
        },
        
        //  VideoSearchResults are never saved to the server.
        sync: function() {
            return false;
        }
    });

    return VideoSearchResult;
});