define(function () {
    'use strict';

    var SaveSources = Backbone.Model.extend({

        defaults: function () {
            return {
                creating: false,
                sources: []
            };
        }

    });

    return SaveSources;
});