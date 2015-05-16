define(function(require) {
    'use strict';

    var FixedMenuItemView = require('foreground/view/element/fixedMenuItemView');
    var FixedMenuItem = require('foreground/model/fixedMenuItem');

    describe('FixedMenuItemView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.fixedMenuItemView = new FixedMenuItemView({
                model: new FixedMenuItem()
            });
        });

        afterEach(function() {
            this.fixedMenuItemView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.fixedMenuItemView.render().el);

            _.forIn(this.fixedMenuItemView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});