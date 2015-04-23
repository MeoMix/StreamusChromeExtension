define(function(require) {
    'use strict';

    var LeftPaneView = require('foreground/view/leftPane/leftPaneView');

    var LeftPaneRegion = Marionette.Region.extend({
        settings: null,

        initialize: function() {
            this.settings = Streamus.backgroundPage.settings;
            this.listenTo(Streamus.channels.foregroundArea.vent, 'rendered', this._onForegroundAreaRendered);
            this.listenTo(Streamus.channels.foregroundArea.vent, 'idle', this._onForegroundAreaIdle);
        },

        _onForegroundAreaRendered: function() {
            if (!this.settings.get('openToSearch')) {
                this.show(new LeftPaneView());
            }
        },

        _onForegroundAreaIdle: function() {
            //  If search is being shown immediately then its OK to defer loading to improve initial
            //  load performance.
            if (this.settings.get('openToSearch')) {
                this.show(new LeftPaneView());
            }
        }
    });

    return LeftPaneRegion;
});