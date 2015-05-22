define(function(require) {
    'use strict';

    var ErrorView = require('foreground/view/dialog/errorView');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('ErrorView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new ErrorView();
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});