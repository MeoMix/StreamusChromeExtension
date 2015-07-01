define(function(require) {
  'use strict';

  var SearchInputAreaView = require('foreground/view/appBar/searchInputAreaView');
  var Search = require('background/model/search');
  var viewTestUtility = require('test/foreground/view/viewTestUtility');

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

    viewTestUtility.ensureBasicAssumptions.call(this);
  });
});