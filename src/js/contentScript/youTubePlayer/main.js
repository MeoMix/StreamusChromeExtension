function injectScripts() {
  var parent = document.body || document.head || document.documentElement;

  if (!parent) {
    setTimeout(injectScripts, 0);
    return;
  }

  var lodash = document.createElement('script');
  lodash.type = 'text/javascript';
  lodash.src = chrome.extension.getURL('/js/lib/lodash.js');
  parent.appendChild(lodash);

  var playerApi = document.createElement('script');
  playerApi.type = 'text/javascript';
  playerApi.src = chrome.extension.getURL('/js/contentScript/youTubePlayer/playerApi.js');
  parent.appendChild(playerApi);
}

injectScripts();

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