define(function (require) {
    'use strict';

    var LeftPaneView = require('foreground/view/leftPane/leftPaneView');

    var LeftPaneRegion = Marionette.Region.extend({
        initialize: function() {
            this.listenTo(Streamus.channels.foregroundArea.vent, 'rendered', this._onForegroundAreaRendered);
        },
        
        _onForegroundAreaRendered: function () {
            this.show(new LeftPaneView());
        }
    });

    return LeftPaneRegion;
});