define(function(require) {
    'use strict';

    var SwitchView = require('foreground/view/element/switchView');
    var Switch = require('foreground/model/switch');

    describe('SwitchView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.switchView = new SwitchView({
                model: new Switch()
            });
        });

        afterEach(function() {
            this.switchView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.switchView.render().el);

            _.forIn(this.switchView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});