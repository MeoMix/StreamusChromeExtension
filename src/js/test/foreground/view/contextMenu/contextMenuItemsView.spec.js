define(function(require) {
    'use strict';

    var ContextMenuItemsView = require('foreground/view/contextMenu/contextMenuItemsView');
    var ContextMenuItems = require('foreground/collection/contextMenu/contextMenuItems');

    describe('ContextMenuItemsView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.contextMenuItemsView = new ContextMenuItemsView({
                collection: new ContextMenuItems()
            });
        });

        afterEach(function() {
            this.contextMenuItemsView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.contextMenuItemsView.render().el);

            _.forIn(this.contextMenuItemsView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});