define(function(require) {
    'use strict';

    var PlaylistItemsView = require('foreground/view/leftPane/playlistItemsView');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('PlaylistItemsView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new PlaylistItemsView();
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});