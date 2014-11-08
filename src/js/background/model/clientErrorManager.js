define([
    'background/collection/clientErrors'
], function (ClientErrors) {
    'use strict';

    var ClientErrorManager = Backbone.Model.extend({
        defaults: function () {
            return {
                platformInfo: {
                    os: '',
                    arch: '',
                    nacl_arch: ''
                },
                reportedErrors: new ClientErrors()
            };
        },

        initialize: function () {
            chrome.runtime.getPlatformInfo(this._onChromeRuntimeGetPlatformInfo.bind(this));
            window.onerror = this._onWindowError.bind(this);
            this.listenTo(Streamus.channels.error.commands, 'log:error', this._logError);
            this.listenTo(Streamus.channels.error.vent, 'windowError', this._onWindowError);
        },
        
        //  Only log client errors to the database in a deploy environment, not when debugging locally.
        _warnDebugEnabled: function(message) {
            console.warn('Debugging enabled; Message:' + message);
        },

        _onChromeRuntimeGetPlatformInfo: function (platformInfo) {
            this.set('platformInfo', platformInfo);
        },

        _onWindowError: function (message, url, lineNumber, columnNumber, error) {
            this._createClientError(message, url, lineNumber, error);
        },
        
        _logError: function(error) {
            this._createClientError(error.message, '', 0, error);
        },
        
        _createClientError: function (message, url, lineNumber, error) {
            if (Streamus.localDebug && !Streamus.testing) {
                this._warnDebugEnabled(message);
                return;
            }

            this.get('reportedErrors').create({
                message: message,
                url: url,
                lineNumber: lineNumber,
                operatingSystem: this.get('platformInfo').os,
                architecture: this.get('platformInfo').arch,
                error: error
            });
        }
    });

    return ClientErrorManager;
});