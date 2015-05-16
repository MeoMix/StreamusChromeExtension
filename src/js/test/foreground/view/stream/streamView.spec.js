define(function(require) {
    'use strict';

    var StreamView = require('foreground/view/stream/streamView');
    var Stream = require('background/model/stream');
    var Player = require('background/model/player');
    var Settings = require('background/model/settings');
    var YouTubePlayer = require('background/model/youTubePlayer');
    var ShuffleButton = require('background/model/shuffleButton');
    var RadioButton = require('background/model/radioButton');
    var RepeatButton = require('background/model/repeatButton');

    describe('StreamView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.streamView = new StreamView({
                model: new Stream({
                    player: new Player({
                        settings: new Settings(),
                        youTubePlayer: new YouTubePlayer()
                    }),
                    shuffleButton: new ShuffleButton(),
                    radioButton: new RadioButton(),
                    repeatButton: new RepeatButton()
                })
            });
        });

        afterEach(function() {
            this.streamView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.streamView.render().el);

            _.forIn(this.streamView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});