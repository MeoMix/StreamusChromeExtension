define(function(require) {
    'use strict';

    var SimpleMenuItemsView = require('foreground/view/element/simpleMenuItemsView');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('SimpleMenuItemsView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new SimpleMenuItemsView();
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});