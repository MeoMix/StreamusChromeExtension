define(function(require) {
    'use strict';

    var ShuffleButtonView = require('foreground/view/stream/shuffleButtonView');
    var ShuffleButton = require('background/model/buttons/shuffleButton');

    describe('ShuffleButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.shuffleButtonView = new ShuffleButtonView({
                model: new ShuffleButton()
            });
        });

        afterEach(function() {
            this.shuffleButtonView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.shuffleButtonView.render().el);

            _.forIn(this.shuffleButtonView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});