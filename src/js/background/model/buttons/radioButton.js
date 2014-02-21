define(function () {
    'use strict';
    
    //  If the foreground requests, don't instantiate -- return existing from the background.
    if (!_.isUndefined(chrome.extension.getBackgroundPage().window.RadioButton)) {
        return chrome.extension.getBackgroundPage().window.RadioButton;
    }

    var RadioButton = Backbone.Model.extend({

        defaults: {
            enabled: false
        },
 
        toggleRadio: function () {
            this.set('enabled', !this.get('enabled'));
        }

    });

    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.RadioButton = new RadioButton();
    return window.RadioButton;
});