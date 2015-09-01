'use strict';
import ErrorView from 'foreground/view/dialog/errorView';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('ErrorView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new ErrorView();
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});