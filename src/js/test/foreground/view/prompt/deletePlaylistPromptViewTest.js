define([
    'foreground/view/prompt/deletePlaylistPromptView',
    'test/testUtility'
], function (DeletePlaylistPromptView, TestUtility) {
    'use strict';

    describe('DeletePlaylistPromptView', function () {
        beforeEach(function () {
            this.documentFragment = document.createDocumentFragment();
            this.view = new DeletePlaylistPromptView({
                playlist: TestUtility.buildPlaylist()
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
            it('should delete its playlist', function () {
                sinon.stub(this.view.contentView, 'deletePlaylist');

                this.view.onSubmit();
                expect(this.view.contentView.deletePlaylist.calledOnce).to.equal(true);

                this.view.contentView.deletePlaylist.restore();
            });
        });
    });
});