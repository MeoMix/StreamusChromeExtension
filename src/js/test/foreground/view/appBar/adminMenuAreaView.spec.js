define(function(require) {
  'use strict';

  var AdminMenuAreaView = require('foreground/view/appBar/adminMenuAreaView');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('AdminMenuAreaView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new AdminMenuAreaView();
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});