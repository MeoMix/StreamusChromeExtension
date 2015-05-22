define(function(require) {
    'use strict';

    var EditPlaylistDialogView = require('foreground/view/dialog/editPlaylistDialogView');
    var TestUtility = require('test/testUtility');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('EditPlaylistDialogView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new EditPlaylistDialogView({
                playlist: TestUtility.buildPlaylist()
            });
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);

        describe('onSubmit', function() {
            it('should edit its playlist', function() {
                sinon.stub(this.view.contentView, 'editPlaylist');

                this.view.onSubmit();
                expect(this.view.contentView.editPlaylist.calledOnce).to.equal(true);

                this.view.contentView.editPlaylist.restore();
            });
        });
    });
});