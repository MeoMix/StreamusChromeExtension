define(function() {
    'use strict';

    var DebugManager = Backbone.Model.extend({
        defaults: function() {
            return {
                flashLoaded: false
            };
        }
    });

    return DebugManager;
});