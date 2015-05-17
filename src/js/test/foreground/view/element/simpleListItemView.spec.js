define(function(require) {
    'use strict';

    var SimpleListItemView = require('foreground/view/element/simpleListItemView');
    var SimpleListItem = require('foreground/model/element/simpleListItem');

    describe('SimpleListItemView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.simpleListItemView = new SimpleListItemView({
                model: new SimpleListItem()
            });
        });

        afterEach(function() {
            this.simpleListItemView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.simpleListItemView.render().el);

            _.forIn(this.simpleListItemView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});