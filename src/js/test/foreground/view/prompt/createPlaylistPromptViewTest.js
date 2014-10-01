define([
    'foreground/view/prompt/createPlaylistPromptView'
], function (CreatePlaylistPromptView) {
    'use strict';

    describe('CreatePlaylistPromptView', function () {
        beforeEach(function () {
            this.documentFragment = document.createDocumentFragment();
            this.view = new CreatePlaylistPromptView();
        });

        afterEach(function () {
            this.view.destroy();
        });

        it('should show', function () {
            this.documentFragment.appendChild(this.view.render().el);
            this.view.triggerMethod('show');
        });
        
        describe('onSubmit', function () {
            it('should create a playlist', function () {
                sinon.stub(this.view.contentView, 'createPlaylist');

                this.view.onSubmit();
                expect(this.view.contentView.createPlaylist.calledOnce).to.equal(true);

                this.view.contentView.createPlaylist.restore();
            });
        });
    });
});