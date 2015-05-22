define(function(require) {
    'use strict';

    var PlaylistsView = require('foreground/view/playlist/playlistsView');
    var Playlists = require('background/collection/playlists');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('PlaylistsView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new PlaylistsView({
                collection: new Playlists()
            });
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});