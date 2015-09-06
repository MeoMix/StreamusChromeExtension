import SearchInputAreaView from 'foreground/view/appBar/searchInputAreaView';
import Search from 'background/model/search';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('SearchAreaView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new SearchInputAreaView({
      search: new Search()
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});