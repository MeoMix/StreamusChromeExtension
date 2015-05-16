define(function(require) {
    'use strict';

    var PlaylistsAreaView = require('foreground/view/playlist/playlistsAreaView');
    var Playlists = require('background/collection/playlists');

    describe('PlaylistsAreaView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.playlistsAreaView = new PlaylistsAreaView({
                playlists: new Playlists()
            });
        });

        afterEach(function() {
            this.playlistsAreaView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.playlistsAreaView.render().el);

            _.forIn(this.playlistsAreaView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});