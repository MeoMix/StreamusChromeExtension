define(function(require) {
    'use strict';

    var SaveSongButtonView = require('foreground/view/listItemButton/saveSongButtonView');
    var StreamItem = require('background/model/streamItem');
    var SignInManager = require('background/model/signInManager');

    describe('SaveSongButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.saveSongButtonView = new SaveSongButtonView({
                //  TODO: This should really be a Song not a StreamItem
                model: new StreamItem(),
                signInManager: new SignInManager()
            });
        });

        afterEach(function() {
            this.saveSongButtonView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.saveSongButtonView.render().el);

            _.forIn(this.saveSongButtonView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});