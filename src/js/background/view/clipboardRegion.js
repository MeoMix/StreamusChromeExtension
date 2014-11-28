define([
	'background/view/clipboardView'
], function (ClipboardView) {
    'use strict';

    var ClipboardRegion = Marionette.Region.extend({
        initialize: function () {
            this.listenTo(Streamus.channels.backgroundArea.vent, 'shown', this._onBackgroundAreaShown);
        },

        _onBackgroundAreaShown: function () {
            this._showClipboardView();
        },

        _showClipboardView: function () {
            var clipboardView = new ClipboardView();
            this.show(clipboardView);
        }
    });

    return ClipboardRegion;
});