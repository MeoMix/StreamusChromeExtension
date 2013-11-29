define([
], function () {
    'use strict';

    var notification;
    var closeNotificationTimeout;
    
    return {
        //  Expects options: { iconUrl: string, title: string, body: string }
        showNotification: function (options) {
            
            //  Spam actions can open a lot of notifications, really only want one at a time I think.
            if (notification) {
                notification.close();
                clearTimeout(closeNotificationTimeout);
            }

            notification = window.webkitNotifications.createNotification(options.iconUrl || '', options.title || '', options.body || '');
            
            notification.show();
            
            closeNotificationTimeout = setTimeout(function () {

                if (notification !== null) {
                    notification.close();
                    notification = null;
                }

            }, 3000);
        }
    };
});