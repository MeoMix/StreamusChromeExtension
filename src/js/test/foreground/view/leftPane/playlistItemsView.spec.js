define(function(require) {
    'use strict';

    var PlaylistItemsView = require('foreground/view/leftPane/playlistItemsView');

    describe('PlaylistItemsView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.playlistItemsView = new PlaylistItemsView();
        });

        afterEach(function() {
            this.playlistItemsView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.playlistItemsView.render().el);

            _.forIn(this.playlistItemsView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});