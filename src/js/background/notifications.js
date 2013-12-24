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
            existingNotificationId = notificationId || '';
        });

        closeNotificationTimeout = setTimeout(function () {

            if (existingNotificationId && existingNotificationId !== '') {
                
                chrome.notifications.clear(existingNotificationId, function () {
                    existingNotificationId = '';
                });
                
            }

        }, 3000);
    }
    
    return {
        //  Expects options: { iconUrl: string, title: string, message: string }
        showNotification: function (options) {
            
            //  TODO: Note: This API is currently available on ChromeOS, Windows, and Mac.
            if (typeof chrome.notifications !== 'undefined') {
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

        }
    };
});