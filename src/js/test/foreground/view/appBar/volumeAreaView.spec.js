define(function(require) {
    'use strict';

    var VolumeAreaView = require('foreground/view/appBar/volumeAreaView');
    var Player = require('background/model/player');
    var Settings = require('background/model/settings');
    var YouTubePlayer = require('background/model/youTubePlayer');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('VolumeAreaView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new VolumeAreaView({
                player: new Player({
                    settings: new Settings(),
                    youTubePlayer: new YouTubePlayer()
                })
            });
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});