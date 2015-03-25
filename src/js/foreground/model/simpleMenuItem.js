define(function() {
    'use strict';

    var SimpleMenuItem = BackboneForeground.Model.extend({
        defaults: {
            text: '',
            value: '',
            selected: false
        }
    });

    return SimpleMenuItem;
});