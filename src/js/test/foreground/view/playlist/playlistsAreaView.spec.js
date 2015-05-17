define(function(require) {
    'use strict';

    var PlaylistsAreaView = require('foreground/view/playlist/playlistsAreaView');
    var Playlists = require('background/collection/playlists');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('PlaylistsAreaView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new PlaylistsAreaView({
                playlists: new Playlists()
            });
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});