define(function(require) {
    'use strict';

    var AboutStreamusView = require('foreground/view/dialog/aboutStreamusView');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('AboutStreamusView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new AboutStreamusView();
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});