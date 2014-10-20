define([
], function() {
    'use strict';

    var Stream = Backbone.Model.extend({
        defaults: function () {
            return {
                items: new StreamItems()
            };
        }
    });

    return Stream;
})