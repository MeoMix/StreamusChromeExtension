define(function(require) {
    'use strict';

    var ActivePlaylistAreaView = require('foreground/view/leftPane/activePlaylistAreaView');
    var Playlist = require('background/model/playlist');
    var StreamItems = require('background/collection/streamItems');

    describe('ActivePlaylistAreaView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();

            var playlist = new Playlist();
            this.activePlaylistAreaView = new ActivePlaylistAreaView({
                model: playlist,
                collection: playlist.get('items'),
                streamItems: new StreamItems()
            });
        });

        afterEach(function() {
            this.activePlaylistAreaView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.activePlaylistAreaView.render().el);

            _.forIn(this.activePlaylistAreaView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});