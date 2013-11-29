//  Exposed globally so that Chrome Extension's foreground can access through chrome.extension.getBackgroundPage()
var ShuffleButton = null;

define(function () {
    'use strict';

    var shuffleButtonModel = Backbone.Model.extend({

        defaults: {
            enabled: false
        },

        toggleEnabled: function () {
            this.set('enabled', !this.get('enabled'));
        }

    });

    ShuffleButton = new shuffleButtonModel;

    return ShuffleButton;
});