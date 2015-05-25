define(function(require) {
  'use strict';

  var UpdateStreamusView = require('foreground/view/dialog/updateStreamusView');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('UpdateStreamusView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new UpdateStreamusView();
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});