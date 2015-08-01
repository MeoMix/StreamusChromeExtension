define(function(require) {
  'use strict';

  var StreamControlBarView = require('foreground/view/streamControlBar/streamControlBarView');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('StreamControlBarView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new StreamControlBarView({
        player: TestUtility.buildPlayer()
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});