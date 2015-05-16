define(function(require) {
    'use strict';

    var SimpleMenuItemView = require('foreground/view/element/simpleMenuItemView');
    var SimpleMenuItem = require('foreground/model/element/simpleMenuItem');

    describe('SimpleMenuItemView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.simpleMenuItemView = new SimpleMenuItemView({
                model: new SimpleMenuItem()
            });
        });

        afterEach(function() {
            this.simpleMenuItemView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.simpleMenuItemView.render().el);

            _.forIn(this.simpleMenuItemView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});