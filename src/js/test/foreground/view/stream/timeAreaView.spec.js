define(function(require) {
    'use strict';

    var TimeAreaView = require('foreground/view/stream/timeAreaView');
    var TimeArea = require('foreground/model/stream/timeArea');
    var StreamItems = require('background/collection/streamItems');
    var Player = require('background/model/player');
    var Settings = require('background/model/settings');
    var YouTubePlayer = require('background/model/youTubePlayer');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('TimeAreaView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new TimeAreaView({
                model: new TimeArea(),
                streamItems: new StreamItems(),
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