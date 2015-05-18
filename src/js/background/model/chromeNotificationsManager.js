define(function(require) {
    'use strict';

    var DesktopNotificationDuration = require('common/enum/desktopNotificationDuration');

    //  Use the chrome.notifications API to create rich notifications using templates and show these notifications to users in the system tray.
    //  Availability: Stable since Chrome 28, but getPermissionLevel since Chrome 32
    //  Permissions: "notifications"
    //  Note: This API is currently available on ChromeOS, Windows, and Mac.
    //  URL: https://developer.chrome.com/extensions/notifications
    var ChromeNotificationsManager = Backbone.Model.extend({
        defaults: {
            shownNotificationId: '',
            closeNotificationTimeout: null,
            defaultNotificationOptions: {
                type: 'basic',
                title: '',
                message: '',
                //  iconUrl is required -- if none given, default to Streamus' icon.
                iconUrl: 'img/streamus_icon128.png',
                //  Priority 0 is a 7-second notification by default and priority 1-2 allows for 25 seconds
                priority: 1
            },
            tabManager: null,
            settings: null
        },

        initialize: function() {
            this.listenTo(Streamus.channels.notification.commands, 'show:notification', this._showNotification);
            //  Background notifications will only show up via desktop notification, normal notification commands will be rendered in the UI if it is open.
            this.listenTo(Streamus.channels.backgroundNotification.commands, 'show:notification', this._showNotification);
        },

        _showNotification: function(notificationOptions) {
            //  Pass along the notification to the foreground if it's open. Otherwise, use desktop notifications to notify the user.
            this._isForegroundActive(this._onIsForegroundActiveResponse.bind(this, notificationOptions));
        },

        _onIsForegroundActiveResponse: function(notificationOptions, foregroundActive) {
            if (!foregroundActive) {
                var chromeNotificationOptions = _.pick(notificationOptions, ['message', 'title', 'iconUrl']);

                if (this._notificationsEnabled()) {
                    chrome.notifications.getPermissionLevel(this._onGetPermissionLevel.bind(this, chromeNotificationOptions));
                }
            }
        },

        _onGetPermissionLevel: function(options, permissionLevel) {
            if (permissionLevel === 'granted') {
                this._createNotification(options);
            }
        },

        _notificationsEnabled: function() {
            return !_.isUndefined(chrome.notifications) && this.get('settings').get('desktopNotificationsEnabled');
        },

        _createNotification: function(options) {
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
            var notificationDuration = this._getNotificationDuration(this.get('settings').get('desktopNotificationDuration'));
            var closeNotificationTimeout = setTimeout(this._onCloseNotificationTimeout.bind(this), notificationDuration);
            this.set('closeNotificationTimeout', closeNotificationTimeout);
        },

        _isForegroundActive: function(callback) {
            var foreground = chrome.extension.getViews({type: 'popup'});

            if (foreground.length === 0) {
                this.get('tabManager').isStreamusTabActive(function(streamusTabActive) {
                    callback(streamusTabActive);
                });
            } else {
                callback(true);
            }
        },

        //  Converts the DesktopNotificationDuration enum into milliseconds for use in setTimeout.
        _getNotificationDuration: function(desktopNotificationDuration) {
            var notificationDuration;

            switch (desktopNotificationDuration) {
                case DesktopNotificationDuration.OneSecond:
                    notificationDuration = 1000;
                    break;
                case DesktopNotificationDuration.TwoSeconds:
                    notificationDuration = 2000;
                    break;
                case DesktopNotificationDuration.ThreeSeconds:
                    notificationDuration = 3000;
                    break;
                case DesktopNotificationDuration.FourSeconds:
                    notificationDuration = 4000;
                    break;
                case DesktopNotificationDuration.FiveSeconds:
                    notificationDuration = 5000;
                    break;
                case DesktopNotificationDuration.TenSeconds:
                    notificationDuration = 10000;
                    break;
                default:
                    throw new Error('Unhandled DesktopNotificationDuration: ' + desktopNotificationDuration);
            }

            return notificationDuration;
        }
    });

    return ChromeNotificationsManager;
});