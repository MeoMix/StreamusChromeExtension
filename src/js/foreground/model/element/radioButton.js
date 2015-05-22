define(function() {
    'use strict';

    var RadioButton = Backbone.Model.extend({
        defaults: {
            checked: false,
            labelText: '',
            value: ''
        }
    });

    return RadioButton;
});