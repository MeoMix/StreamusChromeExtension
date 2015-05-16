define(function(require) {
    'use strict';

    var PreviousButtonView = require('foreground/view/appBar/previousButtonView');

    describe('PreviousButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.previousButtonView = new PreviousButtonView({
                model: Streamus.backgroundPage.previousButton
            });
        });

        afterEach(function() {
            this.previousButtonView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.previousButtonView.render().el);

            _.forIn(this.previousButtonView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});