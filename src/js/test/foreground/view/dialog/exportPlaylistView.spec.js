define(function(require) {
    'use strict';

    var ExportPlaylist = require('foreground/model/dialog/exportPlaylist');
    var ExportPlaylistView = require('foreground/view/dialog/exportPlaylistView');
    var TestUtility = require('test/testUtility');

    describe('ExportPlaylistView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new ExportPlaylistView({
                model: new ExportPlaylist({
                    playlist: TestUtility.buildPlaylist()
                })
            });
        });

        afterEach(function() {
            this.view.destroy();
        });

        it('should show', function() {
            this.documentFragment.appendChild(this.view.render().el);
            this.view.triggerMethod('show');
        });
    });
});