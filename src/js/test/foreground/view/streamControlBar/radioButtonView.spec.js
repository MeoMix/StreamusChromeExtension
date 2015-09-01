'use strict';
import RadioButtonView from 'foreground/view/streamControlBar/radioButtonView';
import RadioButton from 'background/model/radioButton';
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