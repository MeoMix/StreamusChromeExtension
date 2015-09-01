'use strict';
import SearchResultsView from 'foreground/view/search/searchResultsView';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('SearchResultsView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new SearchResultsView();
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});