//  TODO: Not sure how I am feeling about having a common and a background utility object.s
define([
    'background/model/tabManager'
], function (TabManager) {
    'use strict';

    var Utility = Backbone.Model.extend({
        isForegroundActive: function (callback) {
            var foreground = chrome.extension.getViews({ type: "popup" });

            if (foreground.length === 0) {
                TabManager.isStreamusTabActive(function (streamusTabActive) {
                    callback(streamusTabActive);
                });
            } else {
                callback(true);
            }
        }
    });

    return new Utility();
});