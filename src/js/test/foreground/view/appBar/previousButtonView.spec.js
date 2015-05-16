define(function(require) {
    'use strict';

    var PreviousButtonView = require('foreground/view/appBar/previousButtonView');
    var PreviousButton = require('background/model/buttons/previousButton');
    var Stream = require('background/model/stream');
    var Player = require('background/model/player');
    var Settings = require('background/model/settings');
    var YouTubePlayer = require('background/model/youTubePlayer');
    var RadioButton = require('background/model/buttons/radioButton');
    var ShuffleButton = require('background/model/buttons/shuffleButton');
    var RepeatButton = require('background/model/buttons/repeatButton');

    describe('PreviousButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();

            var player = new Player({
                settings: new Settings(),
                youTubePlayer: new YouTubePlayer()
            });

            var shuffleButton = new ShuffleButton();
            var radioButton = new RadioButton();
            var repeatButton = new RepeatButton();

            this.previousButtonView = new PreviousButtonView({
                model: new PreviousButton({
                    player: player,
                    shuffleButton: shuffleButton,
                    repeatButton: repeatButton,
                    stream: new Stream({
                        player: player,
                        shuffleButton: shuffleButton,
                        radioButton: radioButton,
                        repeatButton: repeatButton
                    })
                })
            });
        });

        afterEach(function() {
            this.previousButtonView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.previousButtonView.render().el);

            _.forIn(this.previousButtonView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});