define(function (require) {
    'use strict';

    var LeftPaneView = require('foreground/view/leftPane/leftPaneView');

    var LeftPaneRegion = Marionette.Region.extend({
        initialize: function() {
            this.listenTo(Streamus.channels.foregroundArea.vent, 'shown', this._onForegroundAreaShown);
        },
        
        _onForegroundAreaShown: function () {
            this.show(new LeftPaneView());
        }
    });

    return LeftPaneRegion;
});