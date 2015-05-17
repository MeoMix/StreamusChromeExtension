define(function(require) {
    'use strict';

    var ContextMenuItemsView = require('foreground/view/contextMenu/contextMenuItemsView');
    var ContextMenuItems = require('foreground/collection/contextMenu/contextMenuItems');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('ContextMenuItemsView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new ContextMenuItemsView({
                collection: new ContextMenuItems()
            });
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});