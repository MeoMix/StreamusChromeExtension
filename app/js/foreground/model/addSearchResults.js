define(function () {
    'use strict';

    var AddSearchResults = Backbone.Model.extend({

        defaults: function () {
            return {
                folder: null
            };
        }

    });

    return AddSearchResults;
});