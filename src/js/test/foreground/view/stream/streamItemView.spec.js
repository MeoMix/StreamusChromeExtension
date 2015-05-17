define(function(require) {
    'use strict';

    var StreamItemView = require('foreground/view/stream/streamItemView');
    var StreamItem = require('background/model/streamItem');
    var StreamItems = require('background/collection/streamItems');
    var Player = require('background/model/player');
    var Settings = require('background/model/settings');
    var YouTubePlayer = require('background/model/youTubePlayer');
    var PlayPauseButton = require('background/model/playPauseButton');
    var ListItemType = require('common/enum/listItemType');

    describe('StreamItemView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();

            var player = new Player({
                settings: new Settings(),
                youTubePlayer: new YouTubePlayer()
            });

            this.streamItemView = new StreamItemView({
                model: new StreamItem(),
                player: player,
                playPauseButton: new PlayPauseButton({
                    player: player,
                    streamItems: new StreamItems()
                }),
                type: ListItemType.StreamItem,
                //  TODO: parentId?
                parentId: ''
            });
        });

        afterEach(function() {
            this.streamItemView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.streamItemView.render().el);

            _.forIn(this.streamItemView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});