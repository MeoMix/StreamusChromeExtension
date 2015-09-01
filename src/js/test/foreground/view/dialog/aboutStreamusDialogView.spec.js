'use strict';
import AboutStreamusDialogView from 'foreground/view/dialog/aboutStreamusDialogView';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('AboutStreamusDialogView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new AboutStreamusDialogView();
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});