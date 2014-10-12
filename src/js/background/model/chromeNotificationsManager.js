//  Use the chrome.notifications API to create rich notifications using templates and show these notifications to users in the system tray.
//  Availability: Stable since Chrome 28, but getPermissionLevel since Chrome 32
//  Permissions: "notifications" 
//  Note: This API is currently available on ChromeOS, Windows, and Mac.
//  URL: https://developer.chrome.com/extensions/notifications
define([
    'background/model/utility'
], function (Utility) {
    'use strict';

    var ChromeNotificationsManager = Backbone.Model.extend({
        defaults: {
            shownNotificationId: '',
            closeNotificationTimeout: null,
            defaultNotificationOptions: {
                type: 'basic',
                title: '',
                message: '',
                //  iconUrl is required -- if none given, default to Streamus' icon.
                iconUrl: 'img/streamus_icon128.png'
            }
        },
        
        initialize: function () {
            this.listenTo(Backbone.Wreqr.radio.channel('notification').commands, 'show:notification', this._onShowNotificationCommand);
            //  Background notifications will only show up via desktop notification, normal notification commands will be rendered in the UI if it is open.
            this.listenTo(Backbone.Wreqr.radio.channel('backgroundNotification').commands, 'show:notification', this._onShowNotificationCommand);
        },
        
        _onShowNotificationCommand: function (notificationOptions) {
            //  Pass along the notification to the foreground if it's open. Otherwise, use desktop notifications to notify the user.
            Utility.isForegroundActive(this._onIsForegroundActiveResponse.bind(this, notificationOptions));
        },
                
        _onIsForegroundActiveResponse: function (notificationOptions, foregroundActive) {
            if (!foregroundActive) {
                var chromeNotificationOptions = {
                    //  TODO: ChromeNotifications support a 'Title' property where as my foreground implementation does not. Unsure how to handle this elegantly for now.
                    message: notificationOptions.message
                };
                
                if (!_.isUndefined(notificationOptions.title)) {
                    chromeNotificationOptions.title = notificationOptions.title;
                }

                //  TODO: I don't understand why this is necessary. All clients should be able to call getPermissionLevel just fine because I enforce Chrome32+
                //  TODO: I should log information about what clients are throwing errors (their Google Chrome version?)
                if (this._canUseNotificationsApi()) {
                    chrome.notifications.getPermissionLevel(this._onGetPermissionLevel.bind(this, chromeNotificationOptions));
                }
            }
        },
        
        _onGetPermissionLevel: function (options, permissionLevel) {
            if (permissionLevel === 'granted') {
                this._createNotification(options);
            }
        },
        
        _canUseNotificationsApi: function() {
            return !_.isUndefined(chrome.notifications);
        },
        
        _createNotification: function (options) {
            this._clearCloseNotificationTimeout();

            var notificationOptions = _.extend({}, this.get('defaultNotificationOptions'), options);
            //  Calling create with a notificationId will cause the existing notification to be cleared.
            chrome.notifications.create(this.get('shownNotificationId'), notificationOptions, this._onNotificationCreate.bind(this));

            this._setCloseNotificationTimeout();
        },
        
        _onNotificationCreate: function(notificationId) {
            this.set('shownNotificationId', notificationId);
        },
        
        _onCloseNotificationTimeout: function() {
            var shownNotificationId = this.get('shownNotificationId');

            if (shownNotificationId !== '') {
                this._clearNotification(shownNotificationId);
            }
        },
        
        _onNotificationClear: function() {
            this.set('shownNotificationId', '');
        },
        
        _clearNotification: function(notificationId) {
            chrome.notifications.clear(notificationId, this._onNotificationClear.bind(this));
        },
        
        _clearCloseNotificationTimeout: function() {
            clearTimeout(this.get('closeNotificationTimeout'));
            this.set('closeNotificationTimeout', null);
        },
        
        _setCloseNotificationTimeout: function() {
            var closeNotificationTimeout = setTimeout(this._onCloseNotificationTimeout.bind(this), 3000);
            this.set('closeNotificationTimeout', closeNotificationTimeout);
        }
    });

    return ChromeNotificationsManager;
});