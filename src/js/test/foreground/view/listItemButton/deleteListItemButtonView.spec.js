define(function(require) {
    'use strict';

    var DeleteListItemButtonView = require('foreground/view/listItemButton/deleteListItemButtonView');
    var PlaylistItem = require('background/model/playlistItem');

    describe('DeleteListItemButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.deleteListItemButtonView = new DeleteListItemButtonView({
                model: new PlaylistItem()
            });
        });

        afterEach(function() {
            this.deleteListItemButtonView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.deleteListItemButtonView.render().el);

            _.forIn(this.deleteListItemButtonView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});