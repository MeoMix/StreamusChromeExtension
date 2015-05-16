define(function(require) {
    'use strict';

    var NextButtonView = require('foreground/view/appBar/nextButtonView');
    var NextButton = require('background/model/nextButton');
    var Stream = require('background/model/stream');
    var Player = require('background/model/player');
    var Settings = require('background/model/settings');
    var YouTubePlayer = require('background/model/youTubePlayer');
    var RadioButton = require('background/model/radioButton');
    var ShuffleButton = require('background/model/shuffleButton');
    var RepeatButton = require('background/model/repeatButton');

    describe('NextButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();

            var shuffleButton = new ShuffleButton();
            var radioButton = new RadioButton();
            var repeatButton = new RepeatButton();

            this.nextButtonView = new NextButtonView({
                model: new NextButton({
                    stream: new Stream({
                        player: new Player({
                            settings: new Settings(),
                            youTubePlayer: new YouTubePlayer()
                        }),
                        shuffleButton: shuffleButton,
                        radioButton: radioButton,
                        repeatButton: repeatButton
                    }),
                    radioButton: radioButton,
                    shuffleButton: shuffleButton,
                    repeatButton: repeatButton
                })
            });
        });

        afterEach(function() {
            this.nextButtonView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.nextButtonView.render().el);

            _.forIn(this.nextButtonView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});