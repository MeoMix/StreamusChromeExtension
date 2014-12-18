define(function() {
    'use strict';

    var Switch = Backbone.Model.extend({
        defaults: {
            checked: false,
            labelText: '',
            property: ''
        }
    });

    return Switch;
});