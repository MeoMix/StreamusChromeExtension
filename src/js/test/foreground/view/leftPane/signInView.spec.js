define(function(require) {
    'use strict';

    var SignInView = require('foreground/view/leftPane/signInView');
    var SignInManager = require('background/model/signInManager');

    describe('SignInView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.signInView = new SignInView({
                model: new SignInManager()
            });
        });

        afterEach(function() {
            this.signInView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.signInView.render().el);

            _.forIn(this.signInView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});