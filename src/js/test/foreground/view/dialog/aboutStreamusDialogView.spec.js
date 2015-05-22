define(function(require) {
    'use strict';

    var AboutStreamusDialogView = require('foreground/view/dialog/aboutStreamusDialogView');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('AboutStreamusDialogView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new AboutStreamusDialogView();
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});