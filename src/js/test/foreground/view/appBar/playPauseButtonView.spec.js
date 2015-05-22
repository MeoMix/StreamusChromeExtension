define(function(require) {
    'use strict';

    var PlayPauseButtonView = require('foreground/view/appBar/playPauseButtonView');
    var PlayPauseButton = require('background/model/playPauseButton');
    var Player = require('background/model/player');
    var Settings = require('background/model/settings');
    var YouTubePlayer = require('background/model/youTubePlayer');
    var StreamItems = require('background/collection/streamItems');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('PlayPauseButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();

            var player = new Player({
                settings: new Settings(),
                youTubePlayer: new YouTubePlayer()
            });

            this.view = new PlayPauseButtonView({
                model: new PlayPauseButton({
                    player: player,
                    streamItems: new StreamItems()
                }),
                player: player
            });
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});