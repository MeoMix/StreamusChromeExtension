define(function(require) {
  'use strict';

  var ShuffleButtonView = require('foreground/view/stream/shuffleButtonView');
  var ShuffleButton = require('background/model/shuffleButton');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('ShuffleButtonView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new ShuffleButtonView({
        model: new ShuffleButton()
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});