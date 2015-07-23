define(function() {
  'use strict';

  require.config({
    baseUrl: 'js/',
    enforceDefine: true,

    paths: {
      // Paths:
      'template': '../template',
      'backbone': 'lib/backbone',
      'backbone.localStorage': 'lib/backbone.localStorage',
      'backbone.marionette': 'lib/backbone.marionette',
      'cocktail': 'lib/cocktail',
      'jquery': 'lib/jquery',
      'jquery-ui': 'lib/jquery-ui',
      'lodash': 'lib/lodash',
      'text': 'lib/text'
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