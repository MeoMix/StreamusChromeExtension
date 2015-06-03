define(function(require) {
  'use strict';

  var BrowserSettingsView = require('foreground/view/dialog/browserSettingsView');
  var Settings = require('background/model/settings');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('BrowserSettingsView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new BrowserSettingsView({
        model: new Settings()
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});