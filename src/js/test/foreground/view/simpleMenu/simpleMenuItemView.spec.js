define(function(require) {
  'use strict';

  var SimpleMenuItemView = require('foreground/view/simpleMenu/simpleMenuItemView');
  var SimpleMenuItem = require('foreground/model/simpleMenu/simpleMenuItem');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('SimpleMenuItemView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new SimpleMenuItemView({
        model: new SimpleMenuItem()
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});