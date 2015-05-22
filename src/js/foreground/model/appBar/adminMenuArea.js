define(function() {
    'use strict';

    var AdminMenuArea = Backbone.Model.extend({
        defaults: {
            menuShown: false
        }
    });

    return AdminMenuArea;
});