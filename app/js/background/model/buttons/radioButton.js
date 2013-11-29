//  Exposed globally so that Chrome Extension's foreground can access through chrome.extension.getBackgroundPage()
var RadioButton = null;

define(function () {
    'use strict';

    var radioButtonModel = Backbone.Model.extend({

        defaults: {
            enabled: false
        },
 
        toggleRadio: function () {
            this.set('enabled', !this.get('enabled'));
        }

    });

    RadioButton = new radioButtonModel;

    return RadioButton;
});