define(function(require) {
  'use strict';

  var SwitchView = require('foreground/view/element/switchView');
  var Switch = require('foreground/model/element/switch');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('SwitchView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new SwitchView({
        model: new Switch()
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});