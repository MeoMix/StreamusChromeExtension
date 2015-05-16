define(function(require) {
    'use strict';

    var SimpleMenuView = require('foreground/view/element/simpleMenuView');
    var SimpleMenu = require('foreground/model/simpleMenu');

    describe('SimpleMenuView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.simpleMenuView = new SimpleMenuView({
                model: new SimpleMenu()
            });
        });

        afterEach(function() {
            this.simpleMenuView.destroy();
        });

        //  TODO: fix
        xit('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.simpleMenuView.render().el);

            _.forIn(this.simpleMenuView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});