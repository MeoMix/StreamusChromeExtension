define(function(require) {
  'use strict';

  require('backbone.marionette');

  // Finally, load the application which will initialize the youTubePlayer:
  require(['application'], function(Application) {
    window.Application = new Application();
    window.Application.start();
  });
});