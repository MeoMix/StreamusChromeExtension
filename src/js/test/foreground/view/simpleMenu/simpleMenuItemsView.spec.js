'use strict';
import SimpleMenuItemsView from 'foreground/view/simpleMenu/simpleMenuItemsView';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('SimpleMenuItemsView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new SimpleMenuItemsView();
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});