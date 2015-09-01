'use strict';
import AppBarView from 'foreground/view/appBar/appBarView';
import SignInManager from 'background/model/signInManager';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('AppBarView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new AppBarView({
      signInManager: new SignInManager()
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});