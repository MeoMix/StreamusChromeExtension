define([
	'background/view/clipboardView'
], function (ClipboardView) {
    'use strict';

    var ClipboardRegion = Backbone.Marionette.Region.extend({
        el: '#backgroundArea-clipboardRegion',

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