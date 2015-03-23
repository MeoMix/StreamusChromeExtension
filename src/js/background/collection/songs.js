define(function(require) {
    'use strict';

    var Song = require('background/model/song');

    var Songs = Backbone.Collection.extend({
        model: Song
    });

    return Songs;
});