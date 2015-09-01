'use strict';
import ListItemButtonsView from 'foreground/view/listItemButton/listItemButtonsView';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('ListItemButtonsView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new ListItemButtonsView();
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});