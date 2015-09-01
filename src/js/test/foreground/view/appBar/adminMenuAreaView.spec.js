'use strict';
import AdminMenuAreaView from 'foreground/view/appBar/adminMenuAreaView';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('AdminMenuAreaView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new AdminMenuAreaView();
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});