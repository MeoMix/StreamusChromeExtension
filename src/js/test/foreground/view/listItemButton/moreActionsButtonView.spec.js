define(function(require) {
    'use strict';

    var MoreActionsButtonView = require('foreground/view/listItemButton/moreActionsButtonView');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('MoreActionsButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new MoreActionsButtonView();
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});