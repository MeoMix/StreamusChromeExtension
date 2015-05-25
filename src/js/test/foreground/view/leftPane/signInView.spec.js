define(function(require) {
  'use strict';

  var SignInView = require('foreground/view/leftPane/signInView');
  var SignInManager = require('background/model/signInManager');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('SignInView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new SignInView({
        model: new SignInManager()
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});