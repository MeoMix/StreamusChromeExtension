import {Model} from 'backbone';
//import 'analytics';

var AnalyticsManager = Model.extend({
  defaults: {
    module: null
  },

  initialize: function() {
    this._createModule();
  },

  sendPageView: function(url) {
    this.get('module')('send', 'pageview', url);
  },

  // The default GA code has been modified to work within the extension environment.
  // More information regarding GA and extensions: https://developer.chrome.com/extensions/tut_analytics
  // More information regarding UA: https://developers.google.com/analytics/devguides/collection/analyticsjs/
  _createModule: function() {
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
  }
});

export default AnalyticsManager;