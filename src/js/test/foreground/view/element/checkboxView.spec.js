define(function(require) {
    'use strict';

    var CheckboxView = require('foreground/view/element/checkboxView');
    var Checkbox = require('foreground/model/checkbox');

    describe('CheckboxView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.checkboxView = new CheckboxView({
                model: new Checkbox()
            });
        });

        afterEach(function() {
            this.checkboxView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.checkboxView.render().el);

            _.forIn(this.checkboxView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});