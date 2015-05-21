define(function(require) {
    'use strict';

    var PlaylistOptionsButtonView = require('foreground/view/listItemButton/playlistOptionsButtonView');
    var ListItemButton = require('foreground/model/listItemButton/listItemButton');
    var Playlist = require('background/model/playlist');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('PlaylistOptionsButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new PlaylistOptionsButtonView({
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