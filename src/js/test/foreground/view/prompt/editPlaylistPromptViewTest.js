define([
    'foreground/view/prompt/editPlaylistPromptView',
    'test/testUtility'
], function (EditPlaylistPromptView, TestUtility) {
    'use strict';

    describe('EditPlaylistPromptView', function () {
        beforeEach(function () {
            this.documentFragment = document.createDocumentFragment();
            this.view = new EditPlaylistPromptView({
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
            it('should edit its playlist', function () {
                sinon.stub(this.view.contentView, 'editPlaylist');

                this.view.onSubmit();
                expect(this.view.contentView.editPlaylist.calledOnce).to.equal(true);

                this.view.contentView.editPlaylist.restore();
            });
        });
    });
});