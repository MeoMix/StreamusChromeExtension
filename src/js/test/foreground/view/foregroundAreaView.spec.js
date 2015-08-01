define(function(require) {
  'use strict';

  var ForegroundAreaView = require('foreground/view/foregroundAreaView');
  var Settings = require('background/model/settings');
  var AnalyticsManager = require('background/model/analyticsManager');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('ForegroundAreaView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new ForegroundAreaView({
        el: false,
        player: TestUtility.buildPlayer(),
        settings: new Settings(),
        analyticsManager: new AnalyticsManager()
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});