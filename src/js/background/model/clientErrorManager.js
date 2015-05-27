define(function(require) {
  'use strict';

  var ClientErrors = require('background/collection/clientErrors');

  var ClientErrorManager = Backbone.Model.extend({
    defaults: function() {
      return {
        platformInfo: {
          os: '',
          arch: ''
        },
        language: '',
        signInManager: null,
        reportedErrors: new ClientErrors()
      };
    },

    initialize: function() {
      chrome.runtime.getPlatformInfo(this._onChromeRuntimeGetPlatformInfo.bind(this));

      // It's important to bind pre-emptively or attempts to call removeEventListener will fail to find the appropriate reference.
      this._onWindowError = this._onWindowError.bind(this);
      window.addEventListener('error', this._onWindowError);

      this.listenTo(StreamusBG.channels.error.commands, 'log:error', this._logError);
      this.listenTo(StreamusBG.channels.error.vent, 'windowError', this._onWindowError);
    },

    // Only log client errors to the database in a deploy environment, not when debugging locally.
    _warnDebugEnabled: function(message) {
      console.warn('Debugging enabled; Message:' + message);
    },

    _onChromeRuntimeGetPlatformInfo: function(platformInfo) {
      this.set('platformInfo', platformInfo);
    },

    _onWindowError: function(event) {
      this._createClientError(event.message, event.filename, event.lineno, event.error);
    },

    _logError: function(error) {
      this._createClientError(error.message, '', 0, error);
    },

    _createClientError: function(message, url, lineNumber, error) {
      if (StreamusBG.localDebug && !StreamusBG.testing) {
        this._warnDebugEnabled(message);
        return;
      }

      var signedInUser = this.get('signInManager').get('signedInUser');

      this.get('reportedErrors').create({
        message: message,
        url: url,
        lineNumber: lineNumber,
        operatingSystem: this.get('platformInfo').os,
        architecture: this.get('platformInfo').arch,
        error: error,
        userId: _.isNull(signedInUser) ? '' : signedInUser.get('id')
      });
    }
  });

  return ClientErrorManager;
});