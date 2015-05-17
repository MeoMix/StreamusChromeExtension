define(function(require) {
    'use strict';

    var SearchResultsView = require('foreground/view/search/searchResultsView');

    describe('SearchResultsView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.searchResultsView = new SearchResultsView();
        });

        afterEach(function() {
            this.searchResultsView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.searchResultsView.render().el);

            _.forIn(this.searchResultsView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});