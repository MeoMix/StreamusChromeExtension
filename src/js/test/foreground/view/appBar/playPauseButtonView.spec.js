define(function(require) {
    'use strict';

    var PlayPauseButtonView = require('foreground/view/appBar/playPauseButtonView');

    describe('PlayPauseButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.playPauseButtonView = new PlayPauseButtonView({
                model: Streamus.backgroundPage.playPauseButton,
                player: Streamus.backgroundPage.player
            });
        });

        afterEach(function() {
            this.playPauseButtonView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.playPauseButtonView.render().el);

            _.forIn(this.playPauseButtonView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});