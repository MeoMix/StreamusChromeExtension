define(function(require) {
  'use strict';

  var SearchResultView = require('foreground/view/search/searchResultView');
  var SearchResult = require('background/model/searchResult');
  var StreamItems = require('background/collection/streamItems');
  var ListItemType = require('common/enum/listItemType');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

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

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});