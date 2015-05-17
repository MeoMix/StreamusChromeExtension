define(function(require) {
    'use strict';

    var ListItemButtonsView = require('foreground/view/listItemButton/listItemButtonsView');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('ListItemButtonsView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new ListItemButtonsView();
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});