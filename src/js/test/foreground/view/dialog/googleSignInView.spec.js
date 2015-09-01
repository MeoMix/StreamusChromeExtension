'use strict';
import GoogleSignInView from 'foreground/view/dialog/googleSignInView';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('GoogleSignInView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new GoogleSignInView();
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});