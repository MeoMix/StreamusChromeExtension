define(function () {
    'use strict';

    var VideoSearchResultItem = Backbone.Model.extend({
        
        defaults: {
            video: null
        }

    });

    return VideoSearchResultItem;
})