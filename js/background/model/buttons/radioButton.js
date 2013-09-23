//  Exposed globally so that Chrome Extension's foreground can access through chrome.extension.getBackgroundPage()
var RadioButton = null;

define([
    'settings'
], function (Settings) {
    'use strict';

    var radioButtonModel = Backbone.Model.extend({

        defaults: {
            //  TODO: This isn't entirely necessary anymore, but still might be nice to keep track of when a user reloads the program? Or is it expected that these reset then?
            //  Remember the initial state across sessions by writing to/from localStorage.
            enabled: Settings.get('radioEnabled')
        },
        
        //  TODO: Consider debouncing here, too.
        toggleRadio: function () {
            this.set('enabled', !this.get('enabled'));
            Settings.set('radioEnabled', this.get('enabled'));
        }

    });

    RadioButton = new radioButtonModel;

    return RadioButton;
});