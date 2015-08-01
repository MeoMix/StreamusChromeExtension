define(function(require) {
  'use strict';

  var ErrorDialogView = require('foreground/view/dialog/errorDialogView');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('ErrorDialogView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new ErrorDialogView({
        player: TestUtility.buildPlayer()
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});