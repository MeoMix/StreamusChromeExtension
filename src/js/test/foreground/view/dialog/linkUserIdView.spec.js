define(function(require) {
  'use strict';

  var LinkUserIdView = require('foreground/view/dialog/linkUserIdView');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('LinkUserIdView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new LinkUserIdView();
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});