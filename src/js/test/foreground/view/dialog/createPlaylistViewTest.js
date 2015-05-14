define(function(require) {
    'use strict';

    var CreatePlaylistView = require('foreground/view/dialog/createPlaylistView');

    describe('CreatePlaylistView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new CreatePlaylistView({
                playlists: Streamus.backgroundPage.playlists,
                dataSourceManager: Streamus.backgroundPage.dataSourceManager
            });
        });

        afterEach(function() {
            this.view.destroy();
        });

        it('should show', function() {
            this.documentFragment.appendChild(this.view.render().el);
            this.view.triggerMethod('show');
        });
    });
});