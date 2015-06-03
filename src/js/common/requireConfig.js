define(function() {
  'use strict';

  require.config({
    baseUrl: 'js/',
    enforceDefine: true,

    paths: {
      // Paths:
      'template': '../template',

      // Third Party:
      'backbone': 'thirdParty/backbone',
      'backbone.localStorage': 'thirdParty/backbone.localStorage',
      'backbone.marionette': 'thirdParty/backbone.marionette',
      'cocktail': 'thirdParty/cocktail',
      'jquery': 'thirdParty/jquery',
      'jquery-ui': 'thirdParty/jquery-ui',
      'lodash': 'thirdParty/lodash',
      'text': 'thirdParty/text'
    },

    shim: {
      'https://www.google-analytics.com/analytics.js': {
        exports: 'window.ga'
      }
    },

    map: {
      '*': {
        'underscore': 'lodash'
      }
    }
  });
});