define([
    'foreground/model/exportPlaylist',
    'foreground/view/prompt/exportPlaylistPromptView',
    'test/testUtility'
], function (ExportPlaylist, ExportPlaylistPromptView, TestUtility) {
    'use strict';

    describe('ExportPlaylistPromptView', function () {
        beforeEach(function () {
            this.documentFragment = document.createDocumentFragment();
            this.view = new ExportPlaylistPromptView({
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
        
        describe('onSubmit', function () {
            it('should export its playlist', function () {
                sinon.stub(this.view.contentView, 'exportPlaylist');

                this.view.onSubmit();
                expect(this.view.contentView.exportPlaylist.calledOnce).to.equal(true);

                this.view.contentView.exportPlaylist.restore();
            });
        });
    });
})