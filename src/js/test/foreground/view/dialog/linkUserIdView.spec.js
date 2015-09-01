'use strict';
import LinkUserIdView from 'foreground/view/dialog/linkUserIdView';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('LinkUserIdView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new LinkUserIdView();
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});