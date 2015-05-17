define(function(require) {
    'use strict';

    var ActiveStreamItemView = require('foreground/view/stream/activeStreamItemView');
    var StreamItem = require('background/model/streamItem');
    var Player = require('background/model/player');
    var Settings = require('background/model/settings');
    var YouTubePlayer = require('background/model/youTubePlayer');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('ActiveStreamItemView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new ActiveStreamItemView({
                model: new StreamItem(),
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