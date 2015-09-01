'use strict';
import RepeatButtonView from 'foreground/view/streamControlBar/repeatButtonView';
import RepeatButton from 'background/model/repeatButton';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('RepeatButtonView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new RepeatButtonView({
      model: new RepeatButton()
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});