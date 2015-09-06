import SearchResultView from 'foreground/view/search/searchResultView';
import SearchResult from 'background/model/searchResult';
import StreamItems from 'background/collection/streamItems';
import ListItemType from 'common/enum/listItemType';
import ViewTestUtility from 'test/foreground/view/viewTestUtility';

describe('SearchResultView', function() {
  beforeEach(function() {
    this.documentFragment = document.createDocumentFragment();
    this.view = new SearchResultView({
      model: new SearchResult({
        video: TestUtility.buildVideo()
      }),
      streamItems: new StreamItems(),
      player: TestUtility.buildPlayer(),
      type: ListItemType.SearchResult,
      parentId: 'searchResults-list'
    });
  });

  afterEach(function() {
    this.view.destroy();
  });

  ViewTestUtility.ensureBasicAssumptions.call(this);
});