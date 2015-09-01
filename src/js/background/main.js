'use strict';
// Opening background.html into its own tab causes the program to work incorrectly for a multitude of reasons.
// Prevent this by detecting the background being open outside of its default usage.
if (document.location.pathname === '/background.html' && window !== chrome.extension.getBackgroundPage()) {
  window.close();
}

System.import('background/plugins');