define(function(require) {
    'use strict';

    var PlayPlaylistButtonView = require('foreground/view/listItemButton/playPlaylistButtonView');
    var Playlist = require('background/model/playlist');
    var ListItemButton = require('foreground/model/listItemButton/listItemButton');
    var StreamItems = require('background/collection/streamItems');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('PlayPlaylistButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new PlayPlaylistButtonView({
                model: new ListItemButton(),
                playlist: new Playlist(),
                streamItems: new StreamItems()
            });
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});