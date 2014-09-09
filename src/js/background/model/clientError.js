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
    
    return ClientError;
});