define(function(require) {
    'use strict';

    var PlaylistOptionsButtonView = require('foreground/view/listItemButton/playlistOptionsButtonView');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('PlaylistOptionsButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new PlaylistOptionsButtonView();
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});