define(function(require) {
    'use strict';

    var PlaylistsView = require('foreground/view/playlist/playlistsView');
    var Playlists = require('background/collection/playlists');

    describe('PlaylistsView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.playlistsView = new PlaylistsView({
                collection: new Playlists()
            });
        });

        afterEach(function() {
            this.playlistsView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.playlistsView.render().el);

            _.forIn(this.playlistsView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});