//  TODO: Test more
define([
    'foreground/model/saveSongs',
    'foreground/view/prompt/saveSongsView',
    'test/testUtility'
], function (SaveSongs, SaveSongsView, TestUtility) {
    'use strict';

    describe('SaveSongsView', function () {
        beforeEach(function () {
            this.documentFragment = document.createDocumentFragment();
        });

        describe('with 1 song', function () {
            beforeEach(function() {
                this.view = new SaveSongsView({
                    model: new SaveSongs({
                        songs: TestUtility.getSongArray(1)
                    })
                });
            });
            
            afterEach(function () {
                this.view.destroy();
            });
            
            it('should show', function () {
                this.documentFragment.appendChild(this.view.render().el);
                this.view.triggerMethod('show');
            });
        });

        describe('with >1 song', function () {
            beforeEach(function () {
                this.view = new SaveSongsView({
                    model: new SaveSongs({
                        songs: TestUtility.getSongArray(2)
                    })
                });
            });
            
            afterEach(function () {
                this.view.destroy();
            });

            it('should show', function () {
                this.documentFragment.appendChild(this.view.render().el);
                this.view.triggerMethod('show');
            });
        });
    });
});