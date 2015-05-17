define(function(require) {
    'use strict';

    var PlaylistTitleView = require('foreground/view/appBar/playlistTitleView');
    var Playlist = require('background/model/playlist');

    describe('PlaylistTitleView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.playlistTitleView = new PlaylistTitleView({
                model: new Playlist()
            });
        });

        afterEach(function() {
            this.playlistTitleView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.playlistTitleView.render().el);

            _.forIn(this.playlistTitleView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});