//  Use the chrome.notifications API to create rich notifications using templates and show these notifications to users in the system tray.
//  Availability: Stable since Chrome 28. 
//  Permissions: "notifications" 
//  Note: This API is currently available on ChromeOS, Windows, and Mac.
//  URL: https://developer.chrome.com/extensions/notifications
define(function () {
    'use strict';

    var NotificationsManager = Backbone.Model.extend({
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
        
        //  Expects options: { iconUrl: string, title: string, message: string }
        showNotification: function (options) {
            //  This API is currently available on ChromeOS, Windows, and Mac.
            if (!_.isUndefined(chrome.notifications)) {
                //  Future version of Google Chrome will support permission levels on notifications.
                if (!_.isUndefined(chrome.notifications.getPermissionLevel)) {
                    //  TODO: Reduce nesting
                    chrome.notifications.getPermissionLevel(function(permissionLevel) {
                        if (permissionLevel === 'granted') {
                            this._showNotification(options);
                        }
                    }.bind(this));
                } else {
                    this._showNotification(options);
                }
            }
        },
        
        _showNotification: function (options) {
            clearTimeout(this.get('closeNotificationTimeout'));

            var notificationOptions = _.extend({}, this.get('defaultNotificationOptions'), options);

            //  Calling create with a notificationId will cause the existing notification to be cleared.
            chrome.notifications.create(this.get('shownNotificationId'), notificationOptions, this._onNotificationCreate.bind(this));

            var closeNotificationTimeout = setTimeout(this._onCloseNotificationTimeout.bind(this), 3000);
            this.set('closeNotificationTimeout', closeNotificationTimeout);
        },
        
        _onNotificationCreate: function(notificationId) {
            this.set('shownNotificationId', notificationId);
        },
        
        _onCloseNotificationTimeout: function() {
            var shownNotificationId = this.get('shownNotificationId');

            if (shownNotificationId !== '') {
                chrome.notifications.clear(shownNotificationId, this._onNotificationClear.bind(this));
            }
        },
        
        _onNotificationClear: function() {
            this.set('shownNotificationId', '');
        }
    });

    return new NotificationsManager();
});