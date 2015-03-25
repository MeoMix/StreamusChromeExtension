define(function () {
    'use strict';

    var RadioButton = BackboneForeground.Model.extend({
        checked: false,
        labelText: '',
        value: ''
    });

    return RadioButton;
});