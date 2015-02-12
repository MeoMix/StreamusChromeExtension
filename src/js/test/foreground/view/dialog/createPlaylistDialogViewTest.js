define(function (require) {
    'use strict';

    var CreatePlaylistDialogView = require('foreground/view/dialog/createPlaylistDialogView');

    describe('CreatePlaylistDialogView', function () {
        beforeEach(function () {
            this.documentFragment = document.createDocumentFragment();
            this.view = new CreatePlaylistDialogView();
        });

        afterEach(function () {
            this.view.destroy();
        });

        it('should show', function (done) {
            this.documentFragment.appendChild(this.view.render().el);
            //  Wait before removing the element because destroying the view immediately causes race-condition error due to expectance of HTML presence in _transitionIn
            this.view.onVisible = done;
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