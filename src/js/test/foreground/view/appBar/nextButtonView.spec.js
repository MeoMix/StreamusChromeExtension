define(function(require) {
    'use strict';

    var NextButtonView = require('foreground/view/appBar/nextButtonView');

    describe('NextButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.nextButtonView = new NextButtonView({
                model: Streamus.backgroundPage.nextButton
            });
        });

        afterEach(function() {
            this.nextButtonView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.nextButtonView.render().el);

            _.forIn(this.nextButtonView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});