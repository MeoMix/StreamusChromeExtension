define(function() {
    'use strict';

    var SimpleMenuItem = Backbone.Model.extend({
        defaults: {
            text: '',
            value: '',
            selected: false
        }
    });

    return SimpleMenuItem;
});