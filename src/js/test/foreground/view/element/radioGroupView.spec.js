define(function(require) {
    'use strict';

    var RadioGroupView = require('foreground/view/element/radioGroupView');
    var RadioGroup = require('foreground/model/radioGroup');

    describe('RadioGroupView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.radioGroupView = new RadioGroupView({
                model: new RadioGroup()
            });
        });

        afterEach(function() {
            this.radioGroupView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.radioGroupView.render().el);

            _.forIn(this.radioGroupView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});