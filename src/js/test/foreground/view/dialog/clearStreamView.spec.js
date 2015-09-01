'use strict';
import ClearStreamView from 'foreground/view/dialog/clearStreamView';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('ClearStreamView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new ClearStreamView();
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});