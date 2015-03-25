define(function() {
    'use strict';

    var Switch = BackboneForeground.Model.extend({
        defaults: {
            checked: false,
            labelText: '',
            property: ''
        }
    });

    return Switch;
});