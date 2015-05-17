define(function() {
    'use strict';

    var FixedMenuItem = Backbone.Model.extend({
        defaults: {
            text: ''
        }
    });

    return FixedMenuItem;
});