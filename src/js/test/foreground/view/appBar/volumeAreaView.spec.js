define(function(require) {
    'use strict';

    var VolumeAreaView = require('foreground/view/appBar/volumeAreaView');

    describe('VolumeAreaView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.volumeAreaView = new VolumeAreaView({
                player: Streamus.backgroundPage.player
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