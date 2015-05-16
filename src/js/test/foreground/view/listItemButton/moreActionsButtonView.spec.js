define(function(require) {
    'use strict';

    var MoreActionsButtonView = require('foreground/view/listItemButton/moreActionsButtonView');

    describe('MoreActionsButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.moreActionsButtonView = new MoreActionsButtonView();
        });

        afterEach(function() {
            this.moreActionsButtonView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.moreActionsButtonView.render().el);

            _.forIn(this.moreActionsButtonView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});