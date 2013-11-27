define(function() {
    'use strict';

    var VideoSearchResult = Backbone.Model.extend({
        defaults: {
            selected: false,
            //  Whether the item was the first to be selected or one of many.
            //  Important for proper shift+click functionality.
            firstSelected: false,

            //  Store the whole video for saving later
            video: null
        }
    });

    return VideoSearchResult;
});