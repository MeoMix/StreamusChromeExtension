define(function(require) {
    'use strict';

    var PlaylistView = require('foreground/view/playlist/playlistView');
    var Playlist = require('background/model/playlist');
    var ListItemType = require('common/enum/listItemType');

    describe('PlaylistView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.playlistView = new PlaylistView({
                model: new Playlist(),
                type: ListItemType.Playlist,
                parentId: 'playlists-list'
            });
        });

        afterEach(function() {
            this.playlistView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.playlistView.render().el);

            _.forIn(this.playlistView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});