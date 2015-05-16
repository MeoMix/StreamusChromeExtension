define(function(require) {
    'use strict';

    var SimpleMenuItemsView = require('foreground/view/element/simpleMenuItemsView');

    describe('SimpleMenuItemsView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.simpleMenuItemsView = new SimpleMenuItemsView();
        });

        afterEach(function() {
            this.simpleMenuItemsView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.simpleMenuItemsView.render().el);

            _.forIn(this.simpleMenuItemsView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});