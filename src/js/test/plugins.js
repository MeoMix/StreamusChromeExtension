define(function(require) {
  'use strict';

  require('backbone.marionette');
  require('backbone.localStorage');
  require('jquery-ui');
  require('test/phantomjs.shim');
  require('test/chrome.mock');

  var Cocktail = require('cocktail');
  Cocktail.patch(Backbone);

  var lodashMixin = require('common/lodashMixin');
  _.mixin(lodashMixin);

  window.expect = chai.expect;

  // Make describe/it defined for viewing in browser
  window.mocha.setup({
    ui: 'bdd'
  });

  // Finally, load the tests:
  require(['background/application', 'foreground/application', 'test/test'], function(BackgroundApplication, ForegroundApplication) {
    window.StreamusBG = new BackgroundApplication();
    window.StreamusBG.instantiateBackgroundArea();

    window.StreamusFG = new ForegroundApplication({
      backgroundProperties: window.StreamusBG.getExposedProperties(),
      backgroundChannels: window.StreamusBG.getExposedChannels()
    });

    window.mocha.run();
  });
});