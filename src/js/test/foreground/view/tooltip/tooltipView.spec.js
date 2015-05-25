define(function(require) {
  'use strict';

  var TooltipView = require('foreground/view/tooltip/tooltipView');
  var Tooltip = require('foreground/model/tooltip/tooltip');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('TooltipView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new TooltipView({
        model: new Tooltip()
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});