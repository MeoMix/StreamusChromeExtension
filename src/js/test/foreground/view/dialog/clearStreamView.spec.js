define(function(require) {
    'use strict';

    var ClearStreamView = require('foreground/view/dialog/clearStreamView');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('ClearStreamView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new ClearStreamView();
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});