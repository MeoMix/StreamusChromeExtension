define(function () {
    'use strict';

    var SaveSongs = Backbone.Model.extend({
        defaults: function () {
            return {
                creating: false,
                songs: []
            };
        }
    });

    return SaveSongs;
});