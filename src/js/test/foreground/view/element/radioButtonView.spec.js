define(function(require) {
    'use strict';

    var RadioButtonView = require('foreground/view/element/radioButtonView');
    var RadioButton = require('foreground/model/radioButton');

    describe('RadioButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.radioButtonView = new RadioButtonView({
                model: new RadioButton()
            });
        });

        afterEach(function() {
            this.radioButtonView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.radioButtonView.render().el);

            _.forIn(this.radioButtonView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});