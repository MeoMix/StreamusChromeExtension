//  Exposed globally so that Chrome Extension's foreground can access through chrome.extension.getBackgroundPage()
var VideoDisplayButton = null;

define(function () {
    'use strict';

    var videoDisplayButtonModel = Backbone.Model.extend({

        defaults: {
            enabled: false
        },

        //  TODO: Consider debouncing here, too.
        toggleEnabled: function () {
            this.set('enabled', !this.get('enabled'));
        }

    });

    VideoDisplayButton = new videoDisplayButtonModel;

    return VideoDisplayButton;
});