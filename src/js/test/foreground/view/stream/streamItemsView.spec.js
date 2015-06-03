define(function(require) {
  'use strict';

  var StreamItemsView = require('foreground/view/stream/streamItemsView');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('StreamItemsView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new StreamItemsView();
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});