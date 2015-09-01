'use strict';
import SpinnerView from 'foreground/view/element/spinnerView';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('SpinnerView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new SpinnerView();
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});