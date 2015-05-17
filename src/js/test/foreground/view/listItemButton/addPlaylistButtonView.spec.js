define(function(require) {
    'use strict';

    var AddPlaylistButtonView = require('foreground/view/listItemButton/addPlaylistButtonView');
    var Playlist = require('background/model/playlist');
    var StreamItems = require('background/collection/streamItems');

    describe('AddPlaylistButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.addPlaylistButtonView = new AddPlaylistButtonView({
                model: new Playlist(),
                streamItems: new StreamItems()
            });
        });

        afterEach(function() {
            this.addPlaylistButtonView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.addPlaylistButtonView.render().el);

            _.forIn(this.addPlaylistButtonView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});