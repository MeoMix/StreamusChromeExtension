define(function(require) {
    'use strict';

    var AddSongButtonView = require('foreground/view/listItemButton/addSongButtonView');
    var Song = require('background/model/song');
    var StreamItems = require('background/collection/streamItems');
    var ListItemButton = require('foreground/model/listItemButton/listItemButton');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('AddSongButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new AddSongButtonView({
                model: new ListItemButton(),
                song: new Song(),
                streamItems: new StreamItems()
            });
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});