define(function(require) {
    'use strict';

    var LeftPaneView = require('foreground/view/leftPane/leftPaneView');

    var LeftPaneRegion = Marionette.Region.extend({
        settings: null,

        initialize: function() {
            this.settings = Streamus.backgroundPage.settings;
            this.listenTo(Streamus.channels.foregroundArea.vent, 'rendered', this._onForegroundAreaRendered);
        },

        _onForegroundAreaRendered: function() {
            //  If Streamus is going to show search immediately then its OK to defer loading this view for a frame
            //  to improve performance because it won't be visible.
            if (this.settings.get('openToSearch')) {
                window.requestAnimationFrame(function() {
                    this.show(new LeftPaneView());
                }.bind(this));
            } else {
                this.show(new LeftPaneView());
            }
        }
    });

    return LeftPaneRegion;
});