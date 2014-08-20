//  Holds all the relevant data for a client-side error
define([
    'background/model/settings'
], function (Settings) {
    'use strict';

    var ClientError = Backbone.Model.extend({
        defaults: function () {
            //  Support testing and general graceful fallback by checking for existence of applicationDetails.
            var manifest = typeof chrome === 'undefined' ? '' : chrome.runtime.getManifest();
            var clientVersion = manifest ? manifest.version : 'Unknown';

            return {
                message: '',
                lineNumber: -1,
                url: '',
                clientVersion: clientVersion,
                operatingSystem: '',
                architecture: '',
                stack: ''
            };
        },
        
        urlRoot: Settings.get('serverURL') + 'ClientError/',
        
        initialize: function (attributes) {
            var message = attributes.message;
            if (message && message.length > 255) {
                this.set('message', message.substring(0, 252) + '...');
            }
            
            var stack = attributes.stack;
            if (stack && stack.length > 2000) {
                this.set('stack', stack.substring(0, 1997) + '...');
            }
        },
        
        validate: function (attributes) {
            if (attributes.message.length > 255) {
                return 'Message length must be no longer than 255 characters';
            }
            
            if (attributes.stack.length > 2000) {
                return 'Stack length must be no longer than 2000 characters';
            }

            return undefined;
        }
    });
    
    var platformInfo = {
        os: '',
        arch: '',
        nacl_arch: ''
    };

    chrome.runtime.getPlatformInfo(function(platformInfoResponse) {
        platformInfo = platformInfoResponse;
    });
    
    //  Send a log message whenever any client errors occur; for debugging purposes.
    window.onerror = _.throttle(function (message, url, lineNumber, columnNumber, errorObject) {
        //  Only log client errors to the database in a deploy environment, not when debugging locally.
        if (!Settings.get('localDebug')) {
            //  The first part of the URL is always the same and not very interesting. Drop it off.
            url = url.replace('chrome-extension://jbnkffmindojffecdhbbmekbmkkfpmjd/', '');

            var stack = '';
            //  errorObject can be null or undefined
            if (errorObject) {
                //  If just throw is called without creating an Error object then errorObject.stack will be undefined and just the text should be relied upon.
                if (_.isUndefined(errorObject.stack)) {
                    stack = errorObject;
                } else {
                    stack = errorObject.stack;
                }
            }

            var clientError = new ClientError({
                message: message,
                url: url,
                lineNumber: lineNumber,
                operatingSystem: platformInfo.os,
                architecture: platformInfo.arch,
                stack: stack
            });

            clientError.save();
        }
    }, 60000);

    return ClientError;
});