define(function(require) {
    'use strict';

    var AddPlaylistButtonView = require('foreground/view/listItemButton/addPlaylistButtonView');
    var Playlist = require('background/model/playlist');
    var StreamItems = require('background/collection/streamItems');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('AddPlaylistButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new AddPlaylistButtonView({
                model: new Playlist(),
                streamItems: new StreamItems()
            });
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});