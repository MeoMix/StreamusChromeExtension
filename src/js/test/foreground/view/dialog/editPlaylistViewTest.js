﻿define([
    'foreground/view/dialog/editPlaylistView',
    'test/testUtility'
], function (EditPlaylistView, TestUtility) {
    'use strict';

    describe('EditPlaylistView', function () {
        beforeEach(function () {
            this.documentFragment = document.createDocumentFragment();
            this.view = new EditPlaylistView({
                model: TestUtility.buildPlaylist()
            });
        });

        afterEach(function () {
            this.view.destroy();
        });

        it('should show', function () {
            this.documentFragment.appendChild(this.view.render().el);
            this.view.triggerMethod('show');
        });
        
        //  TODO: There's a lot more to test here.
    });
});