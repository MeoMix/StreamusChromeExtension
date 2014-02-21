define([
], function() {
    'use strict';

    var SaveVideos = Backbone.Model.extend({
        
        defaults: function () {
            return {
                creating: false,
                videos: []
            };
        }

    });

    return SaveVideos;
})