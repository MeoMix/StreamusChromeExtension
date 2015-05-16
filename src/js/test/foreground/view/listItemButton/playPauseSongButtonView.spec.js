define(function(require) {
    'use strict';

    var PlayPauseSongButtonView = require('foreground/view/listItemButton/playPauseSongButtonView');
    var StreamItems = require('background/collection/streamItems');
    var Player = require('background/model/player');
    var Settings = require('background/model/settings');
    var YouTubePlayer = require('background/model/youTubePlayer');
    var PlaylistItem = require('background/model/playlistItem');

    describe('PlayPauseSongButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.playPauseSongButtonView = new PlayPauseSongButtonView({
                //  TODO: This should really be a Song not a ListItem
                model: new PlaylistItem(),
                streamItems: new StreamItems(),
                player: new Player({
                    settings: new Settings(),
                    youTubePlayer: new YouTubePlayer()
                })
            });
        });

        afterEach(function() {
            this.playPauseSongButtonView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.playPauseSongButtonView.render().el);

            _.forIn(this.playPauseSongButtonView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});