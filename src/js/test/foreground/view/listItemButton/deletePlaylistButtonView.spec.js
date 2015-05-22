define(function(require) {
    'use strict';

    var DeletePlaylistButtonView = require('foreground/view/listItemButton/deletePlaylistButtonView');
    var Playlist = require('background/model/playlist');
    var ListItemButton = require('foreground/model/listItemButton/listItemButton');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('DeletePlaylistButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new DeletePlaylistButtonView({
                model: new ListItemButton(),
                playlist: new Playlist()
            });
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});