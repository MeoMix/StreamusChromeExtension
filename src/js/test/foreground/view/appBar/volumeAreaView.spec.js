define(function(require) {
    'use strict';

    var VolumeAreaView = require('foreground/view/appBar/volumeAreaView');
    var Player = require('background/model/player');
    var Settings = require('background/model/settings');
    var YouTubePlayer = require('background/model/youTubePlayer');

    describe('VolumeAreaView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.volumeAreaView = new VolumeAreaView({
                player: new Player({
                    settings: new Settings(),
                    youTubePlayer: new YouTubePlayer()
                })
            });
        });

        afterEach(function() {
            this.volumeAreaView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.volumeAreaView.render().el);

            _.forIn(this.volumeAreaView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});