define(function(require) {
  'use strict';

  var GoogleSignInView = require('foreground/view/dialog/googleSignInView');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('GoogleSignInView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new GoogleSignInView();
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});