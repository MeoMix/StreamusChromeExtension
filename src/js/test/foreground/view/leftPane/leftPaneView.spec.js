define(function(require) {
    'use strict';

    var LeftPaneView = require('foreground/view/leftPane/leftPaneView');
    var SignInManager = require('background/model/signInManager');

    describe('LeftPaneView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.leftPaneView = new LeftPaneView({
                signInManager: new SignInManager()
            });
        });

        afterEach(function() {
            this.leftPaneView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.leftPaneView.render().el);

            _.forIn(this.leftPaneView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});