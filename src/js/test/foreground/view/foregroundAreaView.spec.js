define(function(require) {
    'use strict';

    var ForegroundAreaView = require('foreground/view/foregroundAreaView');
    var Player = require('background/model/player');
    var Settings = require('background/model/settings');
    var YouTubePlayer = require('background/model/youTubePlayer');
    var AnalyticsManager = require('background/model/analyticsManager');

    describe('ForegroundAreaView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.foregroundAreaView = new ForegroundAreaView({
                el: false,
                player: new Player({
                    settings: new Settings(),
                    youTubePlayer: new YouTubePlayer()
                }),
                settings: new Settings(),
                analyticsManager: new AnalyticsManager()
            });
        });

        afterEach(function() {
            this.foregroundAreaView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.foregroundAreaView.render().el);

            _.forIn(this.foregroundAreaView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});