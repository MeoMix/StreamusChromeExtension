define([
    'foreground/model/exportPlaylist',
    'foreground/view/prompt/exportPlaylistView',
    'test/testUtility'
], function (ExportPlaylist, ExportPlaylistView, TestUtility) {
    'use strict';

    describe('ExportPlaylistView', function () {
        beforeEach(function () {
            this.documentFragment = document.createDocumentFragment();
            this.view = new ExportPlaylistView({
                model: new ExportPlaylist({
                    playlist: TestUtility.buildPlaylist()
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
        
        //  TODO: There's a lot more to test here.
    });
});