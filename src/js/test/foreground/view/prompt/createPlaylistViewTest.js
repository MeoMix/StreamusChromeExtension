define([
    'foreground/view/prompt/createPlaylistView'
], function (CreatePlaylistView) {
    'use strict';

    describe('CreatePlaylistView', function () {
        beforeEach(function () {
            this.documentFragment = document.createDocumentFragment();
            this.view = new CreatePlaylistView();
        });

        afterEach(function () {
            this.view.destroy();
        });

        it('should show', function () {
            this.documentFragment.appendChild(this.view.render().el);
            this.view.triggerMethod('show');
        });
        
        //  TODO: There's a lot more test cases to be done here.
    });
});