define([
    'background/collection/clientErrors'
], function (ClientErrors) {
    'use strict';

    var ClientErrorManager = Backbone.Model.extend({
        defaults: {
            platformInfo: {
                os: '',
                arch: '',
                nacl_arch: ''
            },
            reportedErrors: new ClientErrors()
        },

        initialize: function () {
            chrome.runtime.getPlatformInfo(this._onGetPlatformInfo.bind(this));
            window.onerror = this._onWindowError.bind(this);
            this.listenTo(Backbone.Wreqr.radio.channel('error').vent, 'iframeInjectFailure', this.logErrorMessage);
        },

        logErrorMessage: function (message) {
            this._createError(message);
        },
        
        //  Only log client errors to the database in a deploy environment, not when debugging locally.
        _warnDebugEnabled: function() {
            console.warn('Debugging is enabled. Skipping write to server.');
        },

        _onGetPlatformInfo: function (platformInfo) {
            this.set('platformInfo', platformInfo);
        },

        _onWindowError: function (message, url, lineNumber, columnNumber, error) {
            this._createError(message, url, lineNumber, error);
        },
        
        _createError: function (message, url, lineNumber, error) {
            if (Streamus.localDebug && !Streamus.testing) {
                this._warnDebugEnabled();
                return;
            }

            this.get('reportedErrors').create({
                message: message,
                url: url || '',
                lineNumber: lineNumber || 0,
                operatingSystem: this.get('platformInfo').os,
                architecture: this.get('platformInfo').arch,
                error: error || new Error()
            });
        }
    });

    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.ClientErrorManager = new ClientErrorManager();
    return window.ClientErrorManager;
});