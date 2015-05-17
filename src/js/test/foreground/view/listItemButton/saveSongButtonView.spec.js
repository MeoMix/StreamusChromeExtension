define(function(require) {
    'use strict';

    var SaveSongButtonView = require('foreground/view/listItemButton/saveSongButtonView');
    var Song = require('background/model/song');
    var SignInManager = require('background/model/signInManager');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('SaveSongButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new SaveSongButtonView({
                model: new Song(),
                signInManager: new SignInManager()
            });
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});