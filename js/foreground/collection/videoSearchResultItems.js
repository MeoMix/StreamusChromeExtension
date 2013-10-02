define([
    'videoSearchResultItem'
], function (VideoSearchResultItem) {
    'use strict';

    var VideoSearchResultItems = Backbone.Collection.extend({
        model: VideoSearchResultItem
    });

    return VideoSearchResultItems;
});