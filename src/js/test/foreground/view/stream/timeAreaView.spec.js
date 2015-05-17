define(function(require) {
    'use strict';

    var TimeAreaView = require('foreground/view/stream/timeAreaView');
    var TimeArea = require('foreground/model/stream/timeArea');
    var StreamItems = require('background/collection/streamItems');
    var Player = require('background/model/player');
    var Settings = require('background/model/settings');
    var YouTubePlayer = require('background/model/youTubePlayer');

    describe('TimeAreaView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.timeAreaView = new TimeAreaView({
                model: new TimeArea(),
                streamItems: new StreamItems(),
                player: new Player({
                    settings: new Settings(),
                    youTubePlayer: new YouTubePlayer()
                })
            });
        });

        afterEach(function() {
            this.timeAreaView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.timeAreaView.render().el);

            _.forIn(this.timeAreaView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});