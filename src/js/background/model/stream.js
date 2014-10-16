define([
], function() {
    'use strict';

    var Stream = Backbone.Model.extend({
        defaults: {
            streamItems: null
        }
    });

    return Stream;
})