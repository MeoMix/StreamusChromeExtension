define(function(require) {
    'use strict';

    var ContextMenuView = require('foreground/view/contextMenu/contextMenuView');

    describe('ContextMenuView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.contextMenuView = new ContextMenuView();
        });

        afterEach(function() {
            this.contextMenuView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.contextMenuView.render().el);

            _.forIn(this.contextMenuView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});