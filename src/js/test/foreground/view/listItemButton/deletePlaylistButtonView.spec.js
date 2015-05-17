define(function(require) {
    'use strict';

    var DeletePlaylistButtonView = require('foreground/view/listItemButton/deletePlaylistButtonView');
    var Playlist = require('background/model/playlist');

    describe('DeletePlaylistButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.deletePlaylistButtonView = new DeletePlaylistButtonView({
                model: new Playlist()
            });
        });

        afterEach(function() {
            this.deletePlaylistButtonView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.deletePlaylistButtonView.render().el);

            _.forIn(this.deletePlaylistButtonView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});