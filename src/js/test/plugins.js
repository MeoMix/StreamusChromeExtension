define(function(require) {
  'use strict';

  require('backbone.marionette');
  require('backbone.localStorage');
  require('jquery-ui');
  //require('mocha');
  var chai = require('chai');
  require('sinon');
  require('test/phantomjs.shim');
  require('test/chrome.mock');

  var Cocktail = require('cocktail');
  Cocktail.patch(Backbone);

  window.expect = chai.expect;
  // You can do this in the grunt config for each mocha task, see the `options` config
  mocha.setup({
    ui: 'bdd',
    ignoreLeaks: true
  });

  // Don't track
  window.notrack = true;
  // Protect from barfs
  window.console = window.console || function() { };

  // Finally, load the tests:
  require(['background/application', 'foreground/application', 'test/test'], function(BackgroundApplication, ForegroundApplication) {
    var streamusBG = new BackgroundApplication();
    window.StreamusBG = streamusBG;
    streamusBG.instantiateBackgroundArea();
    window.StreamusFG = new ForegroundApplication({
      backgroundProperties: streamusBG.getExposedProperties(),
      backgroundChannels: streamusBG.getExposedChannels()
    });
    mocha.run();
  });
});