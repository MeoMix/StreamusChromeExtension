define(function(require) {
    'use strict';

    var CreatePlaylistView = require('foreground/view/dialog/createPlaylistView');
    var CreatePlaylist = require('foreground/model/dialog/createPlaylist');
    var Playlists = require('background/collection/playlists');
    var DataSourceManager = require('background/model/dataSourceManager');
    var testUtility = require('test/testUtility');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('CreatePlaylistView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new CreatePlaylistView({
                model: new CreatePlaylist(),
                playlists: new Playlists([], {
                    userId: testUtility.getGuid()
                }),
                dataSourceManager: new DataSourceManager()
            });
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});