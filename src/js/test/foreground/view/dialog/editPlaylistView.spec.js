define(function(require) {
    'use strict';

    var EditPlaylistView = require('foreground/view/dialog/editPlaylistView');
    var EditPlaylist = require('foreground/model/dialog/editPlaylist');
    var TestUtility = require('test/testUtility');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('EditPlaylistView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new EditPlaylistView({
                model: new EditPlaylist({
                    playlist: TestUtility.buildPlaylist()
                })
            });
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});