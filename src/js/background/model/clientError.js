//  Holds all the relevant data for a client-side error
define(function () {
    'use strict';

    var ClientError = Backbone.Model.extend({
        defaults: function () {
            var browserVersion = window.navigator.appVersion.match(/Chrome\/(.*?) /)[1];
            //  TODO: I'm referencing the global SignInManager here because it would be bad if SignInManager tried to log an error and created a circular reference.
            //  I think I could fix this just by emitting an error via channel rather than going through a public ClientErrorManager method.
            var signedInUser = SignInManager.get('signedInUser');
            
            return {
                userId: signedInUser ? signedInUser.get('id') : '',
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

            this.set('stack', stack);
        }
    });
    
    return ClientError;
});