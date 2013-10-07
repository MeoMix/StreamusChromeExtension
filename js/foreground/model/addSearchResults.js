define(function () {
    'use strict';

    var AddSearchResults = Backbone.Model.extend({

        defaults: function () {
            return {
                relatedFolder: null
            };
        }

    });

    return AddSearchResults;
});