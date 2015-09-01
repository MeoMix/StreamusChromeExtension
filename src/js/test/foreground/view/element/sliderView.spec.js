'use strict';
import SliderView from 'foreground/view/element/sliderView';
import Slider from 'foreground/model/element/slider';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

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

  ViewTestUtility.ensureBasicAssumptions.call(this);
});