define(function(require) {
    'use strict';

    var ContextMenuView = require('foreground/view/contextMenu/contextMenuView');
    var ContextMenu = require('foreground/model/contextMenu/contextMenu');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('ContextMenuView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new ContextMenuView({
                model: new ContextMenu()
            });
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});