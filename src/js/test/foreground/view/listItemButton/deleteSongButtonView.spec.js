define(function(require) {
    'use strict';

    var DeleteSongButtonView = require('foreground/view/listItemButton/deleteSongButtonView');
    var PlaylistItem = require('background/model/playlistItem');

    describe('DeleteSongButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.deleteSongButtonView = new DeleteSongButtonView({
                //  TODO: This should really take a Song object rather than a ListItem
                model: new PlaylistItem()
            });
        });

        afterEach(function() {
            this.deleteSongButtonView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.deleteSongButtonView.render().el);

            _.forIn(this.deleteSongButtonView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});