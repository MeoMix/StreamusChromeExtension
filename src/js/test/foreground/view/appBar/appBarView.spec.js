define(function(require) {
    'use strict';

    var AppBarView = require('foreground/view/appBar/appBarView');
    var Search = require('background/model/search');
    var SignInManager = require('background/model/signInManager');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('AppBarView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new AppBarView({
                signInManager: new SignInManager(),
                search: new Search()
            });
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});