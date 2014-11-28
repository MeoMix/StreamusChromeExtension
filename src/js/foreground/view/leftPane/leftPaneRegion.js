define([
    'foreground/view/leftPane/leftPaneView'
], function (LeftPaneView) {
    'use strict';

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