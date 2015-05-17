define(function(require) {
    'use strict';

    var StreamItemsView = require('foreground/view/stream/streamItemsView');

    describe('StreamItemsView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.streamItemsView = new StreamItemsView();
        });

        afterEach(function() {
            this.streamItemsView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.streamItemsView.render().el);

            _.forIn(this.streamItemsView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});