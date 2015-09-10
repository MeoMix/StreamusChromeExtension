(function injectScripts() {
  'use strict';

  var parent = document.body || document.head || document.documentElement;

  if (!parent) {
    setTimeout(injectScripts, 0);
    return;
  }

  var playerApi = document.createElement('script');
  playerApi.type = 'text/javascript';
  playerApi.src = chrome.extension.getURL('/js/contentScript/youTubePlayer/playerApi.js');
  parent.appendChild(playerApi);
})();