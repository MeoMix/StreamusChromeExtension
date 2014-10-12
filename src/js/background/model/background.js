define([
    'background/model/chromeNotificationsManager'
], function (ChromeNotificationsManager) {
    'use strict';

    var Background = Backbone.Model.extend({
        defaults: {
            chromeNotificationsManager: null
        },

        initialize: function () {
            this.set('chromeNotificationsManager', new ChromeNotificationsManager());
        }
    });

    return Background;
});