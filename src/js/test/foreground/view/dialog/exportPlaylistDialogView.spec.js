define(function(require) {
    'use strict';

    var ExportPlaylist = require('foreground/model/dialog/exportPlaylist');
    var ExportPlaylistDialogView = require('foreground/view/dialog/exportPlaylistDialogView');
    var TestUtility = require('test/testUtility');

    describe('ExportPlaylistDialogView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new ExportPlaylistDialogView({
                model: new ExportPlaylist({
                    playlist: TestUtility.buildPlaylist()
                })
            });
        });

        afterEach(function() {
            this.view.destroy();
        });

        it('should show', function() {
            this.documentFragment.appendChild(this.view.render().el);
            this.view.triggerMethod('show');
        });

        describe('onSubmit', function() {
            it('should export its playlist', function() {
                sinon.stub(this.view.contentView, 'saveAndExport');

                this.view.onSubmit();
                expect(this.view.contentView.saveAndExport.calledOnce).to.equal(true);

                this.view.contentView.saveAndExport.restore();
            });
        });
    });
});