'use strict';
import RadioButtonView from 'foreground/view/element/radioButtonView';
import RadioButton from 'foreground/model/element/radioButton';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('RadioButtonView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new RadioButtonView({
      model: new RadioButton()
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});