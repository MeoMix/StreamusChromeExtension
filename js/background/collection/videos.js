define([
    'video'
], function (Video) {
    'use strict';

    var Videos = Backbone.Collection.extend({
        model: Video
    });

    return Videos;
});