define(function(require) {
    'use strict';

    var SpinnerView = require('foreground/view/element/spinnerView');

    describe('SpinnerView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.spinnerView = new SpinnerView();
        });

        afterEach(function() {
            this.spinnerView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.spinnerView.render().el);

            _.forIn(this.spinnerView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});