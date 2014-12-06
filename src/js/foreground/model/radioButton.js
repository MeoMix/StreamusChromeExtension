define(function () {
    'use strict';

    var RadioButton = Backbone.Model.extend({
        checked: false,
        labelText: ''
    });

    return RadioButton;
});