'use strict';
import SimpleMenuView from 'foreground/view/simpleMenu/simpleMenuView';
import SimpleMenu from 'foreground/model/simpleMenu/simpleMenu';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('SimpleMenuView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new SimpleMenuView({
      model: new SimpleMenu()
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});