define(function(require) {
    'use strict';

    var ActivePlaylistAreaView = require('foreground/view/leftPane/activePlaylistAreaView');
    var Playlist = require('background/model/playlist');
    var StreamItems = require('background/collection/streamItems');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('ActivePlaylistAreaView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();

            var playlist = new Playlist();
            this.view = new ActivePlaylistAreaView({
                model: playlist,
                collection: playlist.get('items'),
                streamItems: new StreamItems()
            });
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});