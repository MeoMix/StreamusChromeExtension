define(function(require) {
    'use strict';

    var DeletePlaylistDialogView = require('foreground/view/dialog/deletePlaylistDialogView');
    var TestUtility = require('test/testUtility');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('DeletePlaylistDialogView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new DeletePlaylistDialogView({
                playlist: TestUtility.buildPlaylist()
            });
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);

        describe('onSubmit', function() {
            it('should delete its playlist', function() {
                sinon.stub(this.view.contentView, 'deletePlaylist');

                this.view.onSubmit();
                expect(this.view.contentView.deletePlaylist.calledOnce).to.equal(true);

                this.view.contentView.deletePlaylist.restore();
            });
        });
    });
});