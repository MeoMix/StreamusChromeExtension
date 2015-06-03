define(function(require) {
  'use strict';

  var CheckboxView = require('foreground/view/element/checkboxView');
  var Checkbox = require('foreground/model/element/checkbox');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('CheckboxView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new CheckboxView({
        model: new Checkbox()
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});