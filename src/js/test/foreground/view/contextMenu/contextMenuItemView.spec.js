define(function(require) {
    'use strict';

    var ContextMenuItemView = require('foreground/view/contextMenu/contextMenuItemView');
    var ContextMenuItem = require('foreground/model/contextMenu/contextMenuItem');

    describe('ContextMenuItemView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.contextMenuItemView = new ContextMenuItemView({
                model: new ContextMenuItem()
            });
        });

        afterEach(function() {
            this.contextMenuItemView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.contextMenuItemView.render().el);

            _.forIn(this.contextMenuItemView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});