define(function(require) {
    'use strict';

    var ActiveStreamItemView = require('foreground/view/stream/activeStreamItemView');
    var StreamItem = require('background/model/streamItem');
    var Player = require('background/model/player');
    var Settings = require('background/model/settings');
    var YouTubePlayer = require('background/model/youTubePlayer');

    describe('ActiveStreamItemView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.activeStreamItemView = new ActiveStreamItemView({
                model: new StreamItem(),
                player: new Player({
                    settings: new Settings(),
                    youTubePlayer: new YouTubePlayer()
                })
            });
        });

        afterEach(function() {
            this.activeStreamItemView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.activeStreamItemView.render().el);

            _.forIn(this.activeStreamItemView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});