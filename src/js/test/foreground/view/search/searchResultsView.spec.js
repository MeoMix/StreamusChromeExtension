define(function(require) {
    'use strict';

    var SearchResultsView = require('foreground/view/search/searchResultsView');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('SearchResultsView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new SearchResultsView();
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});