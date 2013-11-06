define(function () {
    'use strict';

    var VideoSearchResult = Backbone.Model.extend({
        
        defaults: {
            
            selected: false,
            dragging: false,

            //  Store the whole video for saving later
            video: null
        }

    });

    return VideoSearchResult;
})