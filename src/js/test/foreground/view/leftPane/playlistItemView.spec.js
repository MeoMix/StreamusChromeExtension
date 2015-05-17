define(function(require) {
    'use strict';

    var PlaylistItemView = require('foreground/view/leftPane/playlistItemView');
    var PlaylistItem = require('background/model/playlistItem');
    var StreamItems = require('background/collection/streamItems');
    var Player = require('background/model/player');
    var Settings = require('background/model/settings');
    var YouTubePlayer = require('background/model/youTubePlayer');
    var ListItemType = require('common/enum/listItemType');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('PlaylistItemView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new PlaylistItemView({
                model: new PlaylistItem(),
                streamItems: new StreamItems(),
                player: new Player({
                    settings: new Settings(),
                    youTubePlayer: new YouTubePlayer()
                }),
                type: ListItemType.PlaylistItem,
                parentId: 'playlistItems-list'
            });
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});