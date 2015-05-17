define(function(require) {
    'use strict';

    var AppBarView = require('foreground/view/appBar/appBarView');
    var Search = require('background/model/search');
    var SignInManager = require('background/model/signInManager');

    describe('AppBarView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.appBarView = new AppBarView({
                signInManager: new SignInManager(),
                search: new Search()
            });
        });

        afterEach(function() {
            this.appBarView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.appBarView.render().el);

            _.forIn(this.appBarView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});