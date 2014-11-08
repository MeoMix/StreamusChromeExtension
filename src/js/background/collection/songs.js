define([
    'background/model/song'
], function (Song) {
    'use strict';

    var Songs = Backbone.Collection.extend({
        model: Song
    });

    return Songs;
});