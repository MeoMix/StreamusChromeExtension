define(function (require) {
    'use strict';

    var EditPlaylistView = require('foreground/view/dialog/editPlaylistView');
    var TestUtility = require('test/testUtility');

    describe('EditPlaylistView', function () {
        beforeEach(function () {
            this.documentFragment = document.createDocumentFragment();
            this.view = new EditPlaylistView({
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
    });
});