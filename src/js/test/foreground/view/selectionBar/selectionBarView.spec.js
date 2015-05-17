define(function(require) {
    'use strict';

    var SelectionBarView = require('foreground/view/selectionBar/selectionBarView');
    var SelectionBar = require('foreground/model/selectionBar/selectionBar');
    var StreamItems = require('background/collection/streamItems');
    var SearchResults = require('background/collection/searchResults');
    var SignInManager = require('background/model/signInManager');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('SelectionBarView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new SelectionBarView({
                streamItems: new StreamItems(),
                searchResults: new SearchResults(),
                signInManager: new SignInManager(),
                model: new SelectionBar()
            });
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});