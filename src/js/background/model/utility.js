define([
    'background/model/tabManager'
], function (TabManager) {
    'use strict';

    var Utility = Backbone.Model.extend({
        isForegroundOpen: function (callback) {
            var foreground = chrome.extension.getViews({ type: "popup" });

            if (foreground.length === 0) {
                TabManager.isStreamusTabOpen(function (isStreamusTabOpen) {
                    callback(isStreamusTabOpen);
                });
            } else {
                callback(true);
            }
        }
    });

    return new Utility();
});