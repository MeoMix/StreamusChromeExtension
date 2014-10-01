define([
    'background/model/clientError'
], function (ClientError) {
    'use strict';

    var ClientErrorManager = Backbone.Model.extend({
        defaults: {
            platformInfo: {
                os: '',
                arch: '',
                nacl_arch: ''
            }
        },

        initialize: function () {
            chrome.runtime.getPlatformInfo(this._onGetPlatformInfo.bind(this));
            window.onerror = this._onWindowError.bind(this);
        },

        logErrorMessage: function (message) {
            //  Only log client errors to the database in a deploy environment, not when debugging locally.
            if (Streamus.localDebug) {
                console.warn('Debugging is enabled. Skipping write to server.');
            } else {
                var clientError = new ClientError({
                    message: message,
                    lineNumber: 0,
                    operatingSystem: this.get('platformInfo').os,
                    architecture: this.get('platformInfo').arch,
                });

                clientError.save();
            }
        },

        _onGetPlatformInfo: function (platformInfo) {
            this.set('platformInfo', platformInfo);
        },

        //  Send a log message whenever any client errors occur; for debugging purposes.
        _onWindowError: _.throttle(function (message, url, lineNumber, columnNumber, errorObject) {
            //  Only log client errors to the database in a deploy environment, not when debugging locally.
            if (Streamus.localDebug) {
                console.warn('Debugging is enabled. Skipping write to server.');
            } else {
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
                    operatingSystem: this.get('platformInfo').os,
                    architecture: this.get('platformInfo').arch,
                    stack: stack
                });

                clientError.save();
            }
        }, 60000)
    });

    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.ClientErrorManager = new ClientErrorManager();
    return window.ClientErrorManager;
});