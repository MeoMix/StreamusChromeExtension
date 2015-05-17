define(function(require) {
    'use strict';

    var PlayPlaylistButtonView = require('foreground/view/listItemButton/playPlaylistButtonView');
    var Playlist = require('background/model/playlist');
    var StreamItems = require('background/collection/streamItems');

    describe('PlayPlaylistButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.playPlaylistButtonView = new PlayPlaylistButtonView({
                model: new Playlist(),
                streamItems: new StreamItems()
            });
        });

        afterEach(function() {
            this.playPlaylistButtonView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.playPlaylistButtonView.render().el);

            _.forIn(this.playPlaylistButtonView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});