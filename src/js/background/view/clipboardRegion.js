define(function(require) {
    'use strict';

    var ClipboardView = require('background/view/clipboardView');

    var ClipboardRegion = Marionette.Region.extend({
        initialize: function() {
            this.listenTo(Streamus.channels.backgroundArea.vent, 'rendered', this._onBackgroundAreaRendered);
        },

        _onBackgroundAreaRendered: function() {
            this._showClipboardView();
        },

        _showClipboardView: function() {
            var clipboardView = new ClipboardView();
            this.show(clipboardView);
        }
    });

    return ClipboardRegion;
});