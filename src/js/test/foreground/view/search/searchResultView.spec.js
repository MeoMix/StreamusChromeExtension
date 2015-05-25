define(function(require) {
  'use strict';

  var SearchResultView = require('foreground/view/search/searchResultView');
  var SearchResult = require('background/model/searchResult');
  var StreamItems = require('background/collection/streamItems');
  var Player = require('background/model/player');
  var Settings = require('background/model/settings');
  var YouTubePlayer = require('background/model/youTubePlayer');
  var ListItemType = require('common/enum/listItemType');
  var testUtility = require('test/testUtility');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

  describe('SearchResultView', function() {
    beforeEach(function() {
      this.documentFragment = document.createDocumentFragment();
      this.view = new SearchResultView({
        model: new SearchResult({
          song: testUtility.buildSong()
        }),
        streamItems: new StreamItems(),
        player: new Player({
          settings: new Settings(),
          youTubePlayer: new YouTubePlayer()
        }),
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