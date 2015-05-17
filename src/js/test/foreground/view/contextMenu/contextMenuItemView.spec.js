define(function(require) {
    'use strict';

    var ContextMenuItemView = require('foreground/view/contextMenu/contextMenuItemView');
    var ContextMenuItem = require('foreground/model/contextMenu/contextMenuItem');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('ContextMenuItemView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new ContextMenuItemView({
                model: new ContextMenuItem()
            });
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});