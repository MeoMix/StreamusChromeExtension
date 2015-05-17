define(function(require) {
    'use strict';

    var VideoView = require('foreground/view/video/videoView');
    var Player = require('background/model/player');
    var Settings = require('background/model/settings');
    var YouTubePlayer = require('background/model/youTubePlayer');

    describe('VideoView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.videoView = new VideoView({
                player: new Player({
                    settings: new Settings(),
                    youTubePlayer: new YouTubePlayer()
                })
            });
        });

        afterEach(function() {
            this.videoView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.videoView.render().el);

            _.forIn(this.videoView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});