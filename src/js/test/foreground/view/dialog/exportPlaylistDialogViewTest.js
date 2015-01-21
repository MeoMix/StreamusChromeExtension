define([
    'foreground/model/exportPlaylist',
    'foreground/view/dialog/exportPlaylistDialogView',
    'test/testUtility'
], function (ExportPlaylist, ExportPlaylistDialogView, TestUtility) {
    'use strict';

    describe('ExportPlaylistDialogView', function () {
        beforeEach(function () {
            this.documentFragment = document.createDocumentFragment();
            this.view = new ExportPlaylistDialogView({
                model: new ExportPlaylist({
                    playlist: TestUtility.buildPlaylist()
                })
            });
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
            it('should export its playlist', function () {
                sinon.stub(this.view.contentView, 'saveAndExport');

                this.view.onSubmit();
                expect(this.view.contentView.saveAndExport.calledOnce).to.equal(true);

                this.view.contentView.saveAndExport.restore();
            });
        });
    });
});