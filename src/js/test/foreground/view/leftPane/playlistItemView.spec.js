define(function(require) {
    'use strict';

    var PlaylistItemView = require('foreground/view/leftPane/playlistItemView');
    var PlaylistItem = require('background/model/playlistItem');
    var StreamItems = require('background/collection/streamItems');
    var Player = require('background/model/player');
    var Settings = require('background/model/settings');
    var YouTubePlayer = require('background/model/youTubePlayer');
    var ListItemType = require('common/enum/listItemType');

    describe('PlaylistItemView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.playlistItemView = new PlaylistItemView({
                model: new PlaylistItem(),
                streamItems: new StreamItems(),
                player: new Player({
                    settings: new Settings(),
                    youTubePlayer: new YouTubePlayer()
                }),
                type: ListItemType.PlaylistItem,
                //  TODO: Figure out parentId
                parentId: ''
            });
        });

        afterEach(function() {
            this.playlistItemView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.playlistItemView.render().el);

            _.forIn(this.playlistItemView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});