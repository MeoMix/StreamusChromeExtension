define([
    'foreground/view/prompt/deletePlaylistView',
    'test/testUtility'
], function (DeletePlaylistView, TestUtility) {
    'use strict';

    describe('DeletePlaylistView', function () {
        beforeEach(function () {
            this.documentFragment = document.createDocumentFragment();
            this.view = new DeletePlaylistView({
                model: TestUtility.buildPlaylist()
            });
        });

        afterEach(function () {
            this.view.destroy();
        });

        it('should show', function () {
            this.documentFragment.appendChild(this.view.render().el);
            this.view.triggerMethod('show');
        });
        
        it('should destroy its model when calling deletePlaylist', function () {
            sinon.stub(this.view.model, 'destroy');

            this.view.deletePlaylist();
            expect(this.view.model.destroy.calledOnce).to.equal(true);

            this.view.model.destroy.restore();
        });
    });
});