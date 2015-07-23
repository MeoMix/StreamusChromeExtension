require.config({
  baseUrl: chrome.extension.getURL('/js/contentScript/youTubePlayer/'),
  enforceDefine: true,

  paths: {
    'template': '../../../template',
    'common': '../../common',
    'backbone': '../../lib/backbone',
    'backbone.marionette': '../../lib/backbone.marionette',
    'jquery': '../../lib/jquery',
    'lodash': '../../lib/lodash',
    'text': '../../lib/text'
  },

  map: {
    '*': {
      'underscore': 'lodash'
    }
  }
});

// Load all of the plugins needed by the youTubePlayer:
require(['plugins']);