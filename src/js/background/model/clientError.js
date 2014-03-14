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
                //  This should be set by the server, not the client, in order to be standard across all client.
                timeOccurred: null,
                operatingSystem: '',
                architecture: ''
            };
        },
        
        urlRoot: Settings.get('serverURL') + 'Error/',
        
        initialize: function (attributes) {

            var message = attributes.message;
            if (message && message.length > 255) {
                this.set('message', message.substring(0, 252) + '...');
            }

        },
        
        validate: function (attributes) {

            if (attributes.message.length > 255) {
                return 'Message length must be no longer than 255 characters';
            }

            return undefined;
        }
        
    });
    
    //  TODO Maybe I should make an error manager.
    var platformInfo = {
        os: '',
        arch: '',
        nacl_arch: ''
    };

    chrome.runtime.getPlatformInfo(function(platformInfoResponse) {
        platformInfo = platformInfoResponse;
        console.log("PlatformInfo:", platformInfo);
    });
    
    //  Send a log message whenever any client errors occur; for debugging purposes.
    window.onerror = _.throttle(function (message, url, lineNumber) {

        //  Only log client errors to the database in a deploy environment, not when debugging locally.
        if (!Settings.get('localDebug')) {
            
            //  The first part of the URL is always the same and not very interesting. Drop it off.
            url = url.replace('chrome-extension://jbnkffmindojffecdhbbmekbmkkfpmjd/', '');
            
            var clientError = new ClientError({
                message: message,
                url: url,
                lineNumber: lineNumber,
                operatingSystem: platformInfo.os,
                architecture: platformInfo.arch
            });

            clientError.save();
        }
    }, 60000);

    return ClientError;
});