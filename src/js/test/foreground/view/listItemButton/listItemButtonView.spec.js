define(function(require) {
    'use strict';

    var ListItemButtonView = require('foreground/view/listItemButton/listItemButtonView');

    //  TODO: This is an abstract view. Probably should be removed in favor of Behaviors.
    xdescribe('ListItemButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.listItemButtonView = new ListItemButtonView();
        });

        afterEach(function() {
            this.listItemButtonView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.listItemButtonView.render().el);

            _.forIn(this.listItemButtonView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});