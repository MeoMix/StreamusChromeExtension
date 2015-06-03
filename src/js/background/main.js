define(['../common/requireConfig'], function() {
  'use strict';

  // Opening background.html into its own tab causes the program to work incorrectly for a multitude of reasons.
  // Prevent this by detecting the background being open outside of its default usage.
  if (document.location.pathname === '/background.html' && window !== chrome.extension.getBackgroundPage()) {
    window.close();
  } else {
    // Then, load all of the plugins needed by the background:
    require(['background/plugins']);
  }
});