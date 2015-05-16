define(function(require) {
    'use strict';

    var PlayPauseButtonView = require('foreground/view/appBar/playPauseButtonView');
    var PlayPauseButton = require('background/model/buttons/playPauseButton');
    var Player = require('background/model/player');
    var Settings = require('background/model/settings');
    var YouTubePlayer = require('background/model/youTubePlayer');
    var StreamItems = require('background/collection/streamItems');

    describe('PlayPauseButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();

            var player = new Player({
                settings: new Settings(),
                youTubePlayer: new YouTubePlayer()
            });

            this.playPauseButtonView = new PlayPauseButtonView({
                model: new PlayPauseButton({
                    player: player,
                    streamItems: new StreamItems()
                }),
                player: player
            });
        });

        afterEach(function() {
            this.playPauseButtonView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.playPauseButtonView.render().el);

            _.forIn(this.playPauseButtonView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});