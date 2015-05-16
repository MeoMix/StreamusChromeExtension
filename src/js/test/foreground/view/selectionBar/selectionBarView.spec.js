define(function(require) {
    'use strict';

    var SelectionBarView = require('foreground/view/selectionBar/selectionBarView');
    var SelectionBar = require('foreground/model/selectionBar');
    var StreamItems = require('background/collection/streamItems');
    var SearchResults = require('background/collection/searchResults');
    var SignInManager = require('background/model/signInManager');

    describe('SelectionBarView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.selectionBarView = new SelectionBarView({
                streamItems: new StreamItems(),
                searchResults: new SearchResults(),
                signInManager: new SignInManager(),
                model: new SelectionBar()
            });
        });

        afterEach(function() {
            this.selectionBarView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.selectionBarView.render().el);

            _.forIn(this.selectionBarView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});