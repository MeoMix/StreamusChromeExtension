define(function(require) {
  'use strict';

  // Overwrite Lo-Dash here to ensure all calls reference the background's Lo-Dash instance.
  // Re-using the Lo-Dash instance prevents memory leaks due to idCounter id collisions.
  window._ = chrome.extension.getBackgroundPage()._;

  require('backbone.marionette');
  require('backbone.localStorage');
  require('jquery-ui');

  // Finally, load the application which will initialize the foreground:
  require(['foreground/application']);
});