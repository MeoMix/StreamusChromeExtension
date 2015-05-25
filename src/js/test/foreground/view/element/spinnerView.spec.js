define(function(require) {
  'use strict';

  var SpinnerView = require('foreground/view/element/spinnerView');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('SpinnerView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new SpinnerView();
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});