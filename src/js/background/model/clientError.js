//  Holds all the relevant data for a client-side error
define([
    'background/model/signInManager'
], function (SignInManager) {
    'use strict';

    var ClientError = Backbone.Model.extend({
        defaults: function () {
            var browserVersion = window.navigator.appVersion.match(/Chrome\/(.*?) /)[1];

            return {
                userId: '',
                message: '',
                lineNumber: -1,
                url: '',
                clientVersion: chrome.runtime.getManifest().version,
                browserVersion: browserVersion || '',
                operatingSystem: '',
                architecture: '',
                stack: '',
                error: null
            };
        },
        
        //  Don't save error because stack is a better representation of error.
        blacklist: ['error'],
        toJSON: function () {
            return this.omit(this.blacklist);
        },
        
        initialize: function () {
            this._dropUrlPrefix();
            this._setStack();
            
            //  TODO: Probably would be better to use req/res or something...
            var signedInUser = SignInManager.get('signedInUser');
            this.set('userId', signedInUser ? signedInUser.get('id') : '');
        },
        
        //  The first part of the URL is always the same and not very interesting. Drop it off.
        _dropUrlPrefix: function () {
            this.set('url', this.get('url').replace('chrome-extension://jbnkffmindojffecdhbbmekbmkkfpmjd/', ''));
        },
        
        _setStack: function() {
            var stack = '';
            var error = this.get('error');

            if (error) {
                //  If just throw is called without creating an Error then error.stack will be undefined and just the text should be relied upon.
                if (_.isUndefined(error.stack)) {
                    stack = error;
                } else {
                    stack = error.stack;
                }
            }

            //  TODO: This is fragile as crap, need to find out a better way to do it.
            stack = stack.replace('at Backbone.Model.extend._createError (chrome-extension://jbnkffmindojffecdhbbmekbmkkfpmjd/js/background/application.js:166:33)', '');
            stack = stack.replace('at Backbone.Model.extend.logMessage (chrome-extension://jbnkffmindojffecdhbbmekbmkkfpmjd/js/background/application.js:138:18)', '');
            stack = stack.replace('Error ');
            stack = stack.trim();

            this.set('stack', stack);
        }
    });
    
    return ClientError;
});