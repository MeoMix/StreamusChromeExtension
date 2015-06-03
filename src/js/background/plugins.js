define(function(require) {
  'use strict';

  require('backbone.marionette');
  require('backbone.localStorage');

  var Cocktail = require('cocktail');
  Cocktail.patch(Backbone);

  var lodashMixin = require('common/lodashMixin');
  _.mixin(lodashMixin);

  // Some sensitive data is not committed to GitHub. Use an example file to help others and provide detection of incomplete setup.
  requirejs.onError = function(error) {
    var headerWritten = false;
    console.error('error:', error);

    if (!_.isNull(error.requireModules)) {
      var consoleWarningStyle = 'color: rgb(66,133,244); font-size: 18px; font-weight: bold;';
      error.requireModules.forEach(function(requireModule) {
        if (requireModule.indexOf('background/key/') !== -1) {
          if (!headerWritten) {
            console.warn('%c ATTENTION! Additional configuration is required', consoleWarningStyle);
            console.warn('%c -----------------------------------------------', consoleWarningStyle);
            headerWritten = true;
          }

          console.warn('%cKey not found. \n Copy "' + requireModule + '.js.example" to "' + requireModule + '.js".', 'color: red');
          console.warn('%cThen, follow the file\'s instructions.', 'color:red ');
        }
      });

      if (headerWritten) {
        console.warn('%c -----------------------------------------------', consoleWarningStyle);
      }
    }
  };

  // Finally, load the application:
  require(['background/application'], function(Application) {
    var streamusBG = new Application();
    window.StreamusBG = streamusBG;
    streamusBG.start();
  });
});