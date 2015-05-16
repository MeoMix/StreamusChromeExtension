define(function(require) {
    'use strict';

    var ListItemButtonsView = require('foreground/view/listItemButton/listItemButtonsView');

    describe('ListItemButtonsView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.listItemButtonsView = new ListItemButtonsView();
        });

        afterEach(function() {
            this.listItemButtonsView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.listItemButtonsView.render().el);

            _.forIn(this.listItemButtonsView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});