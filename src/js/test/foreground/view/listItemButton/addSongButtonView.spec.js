define(function(require) {
    'use strict';

    var AddSongButtonView = require('foreground/view/listItemButton/addSongButtonView');
    var Song = require('background/model/song');
    var StreamItems = require('background/collection/streamItems');

    describe('AddSongButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.addSongButtonView = new AddSongButtonView({
                model: new Song(),
                streamItems: new StreamItems()
            });
        });

        afterEach(function() {
            this.addSongButtonView.destroy();
        });

        it('should be able to find all referenced ui targets', function() {
            this.documentFragment.appendChild(this.addSongButtonView.render().el);

            _.forIn(this.addSongButtonView.ui, function(element) {
                expect(element.length).to.not.equal(0);
            });
        });
    });
});