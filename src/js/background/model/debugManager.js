define(function() {
    'use strict';

    var DebugManager = Backbone.Model.extend({
        defaults: function () {
            return {
                youTubeIFrameReferers: [],
                flashLoaded: false
            };
        }
    });

    return DebugManager;
});