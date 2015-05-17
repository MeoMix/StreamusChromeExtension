define(function(require) {
    'use strict';

    var AdminMenuAreaView = require('foreground/view/appBar/adminMenuAreaView');

    describe('AdminMenuAreaView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.adminMenuAreaView = new AdminMenuAreaView();
        });

        afterEach(function() {
            this.adminMenuAreaView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.adminMenuAreaView.render().el);

            _.forIn(this.adminMenuAreaView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});