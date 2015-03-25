define(function () {
    'use strict';

    var Notification = BackboneForeground.Model.extend({
        defaults: {
            message: ''
        }
    });

    return Notification;
});