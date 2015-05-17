define(function(require) {
    'use strict';

    var CreatePlaylistView = require('foreground/view/dialog/createPlaylistView');
    var Playlists = require('background/collection/playlists');
    var DataSourceManager = require('background/model/dataSourceManager');
    var testUtility = require('test/testUtility');

    describe('CreatePlaylistView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new CreatePlaylistView({
                playlists: new Playlists([], {
                    userId: testUtility.getGuid()
                }),
                dataSourceManager: new DataSourceManager()
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