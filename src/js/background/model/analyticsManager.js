define(function(require) {
  'use strict';

  var AnalyticsManager = Backbone.Model.extend({
    defaults: {
      module: null
    },

    // The default GA code has been modified to work within the extension environment.
    // More information regarding GA and extensions: https://developer.chrome.com/extensions/tut_analytics
    // More information regarding UA: https://developers.google.com/analytics/devguides/collection/analyticsjs/
    initialize: function() {
      // Setup temporary Google Analytics objects.
      window.GoogleAnalyticsObject = 'ga';
      window.ga = function() {
        (window.ga.q = window.ga.q || []).push(arguments);
      };
      window.ga.l = 1 * new Date();

      window.ga('create', 'UA-32334126-1', 'auto');
      // UA doesn't work out of the box with Chrome extensions.
      // https://code.google.com/p/analytics-issues/issues/detail?id=312
      // http://stackoverflow.com/questions/16135000/how-do-you-integrate-universal-analytics-in-to-chrome-extensions
      window.ga('set', 'checkProtocolTask', _.noop);
      window.ga('require', 'displayfeatures');
      window.ga('require', 'linkid', 'linkid.js');

      // Create a function that wraps `window.ga`.
      // This allows dependant modules to use `window.ga` without knowingly
      // programming against a global object.
      this.set('module', function() {
        window.ga.apply(this, arguments);
      });

      // Asynchronously load Google Analytics, letting it take over our `window.ga`
      // object after it loads. This allows us to add events to `window.ga` even
      // before the library has fully loaded.
      require(['https://www.google-analytics.com/analytics.js']);
    },

    sendPageView: function(url) {
      this.get('module')('send', 'pageview', url);
    }
  });

  return AnalyticsManager;
});