define(function () {
    'use strict';

    var existingNotificationId = '';
    var closeNotificationTimeout;
    
    function doShowNotification(options) {

        clearTimeout(closeNotificationTimeout);

        var notificationOptions = _.extend({
            type: 'basic',
            title: '',
            message: '',
            iconUrl: ''
        }, options);
        
        //  Calling create with an existingNotificationId will cause the existing notification to be cleared.
        chrome.notifications.create(existingNotificationId, notificationOptions, function (notificationId) {
            existingNotificationId = notificationId;
        });

        closeNotificationTimeout = setTimeout(function () {

            chrome.notifications.clear(existingNotificationId, function() {
                existingNotificationId = '';
            });
            
        }, 3000);
    }
    
    return {
        //  Expects options: { iconUrl: string, title: string, body: string }
        showNotification: function (options) {
            //  TODO: Future version of Google Chrome will support permission levels on notifications.
            if (chrome.notifications.getPermissionLevel) {
                chrome.notifications.getPermissionLevel(function (permissionLevel) {
                    if (permissionLevel === 'granted') {
                        doShowNotification(options);
                    }
                });
            } else {
                doShowNotification(options);
            }

        }
    };
});