define(function(require) {
  'use strict';

  var SliderView = require('foreground/view/element/sliderView');
  var Slider = require('foreground/model/element/slider');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('SliderView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new SliderView({
        model: new Slider()
      });
    });

    afterEach(function() {
      this.view.destroy();
    });

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});