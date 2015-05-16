define(function(require) {
    'use strict';

    var RepeatButtonView = require('foreground/view/stream/repeatButtonView');
    var RepeatButton = require('background/model/buttons/repeatButton');

    describe('RepeatButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.repeatButtonView = new RepeatButtonView({
                model: new RepeatButton()
            });
        });

        afterEach(function() {
            this.repeatButtonView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.repeatButtonView.render().el);

            _.forIn(this.repeatButtonView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});