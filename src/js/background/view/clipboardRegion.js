define(function(require) {
    'use strict';

    var ClipboardView = require('background/view/clipboardView');

    var ClipboardRegion = Marionette.Region.extend({
        initialize: function() {
            this.listenTo(Streamus.channels.backgroundArea.vent, 'attached', this._onBackgroundAreaAttached);
        },

        _onBackgroundAreaAttached: function() {
            this._showClipboardView();
        },

        _showClipboardView: function() {
            var clipboardView = new ClipboardView();
            this.show(clipboardView);
        }
    });

    return ClipboardRegion;
});