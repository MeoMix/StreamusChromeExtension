define(function(require) {
  'use strict';

  var LeftPaneView = require('foreground/view/leftPane/leftPaneView');
  var SignInManager = require('background/model/signInManager');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('LeftPaneView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new LeftPaneView({
        signInManager: new SignInManager()
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});