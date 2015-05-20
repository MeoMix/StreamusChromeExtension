define(function(require) {
    'use strict';

    var SongOptionsButtonView = require('foreground/view/listItemButton/songOptionsButtonView');
    var viewTestUtility = require('test/foreground/view/viewTestUtility');

    describe('SongOptionsButtonView', function() {
        beforeEach(function() {
            this.documentFragment = document.createDocumentFragment();
            this.view = new SongOptionsButtonView();
        });

        afterEach(function() {
            this.view.destroy();
        });

        viewTestUtility.ensureBasicAssumptions.call(this);
    });
});