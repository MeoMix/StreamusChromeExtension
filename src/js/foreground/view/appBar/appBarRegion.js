define([
    'foreground/view/appBar/appBarView'
], function (AppBarView) {
    'use strict';

    var AppBarRegion = Marionette.Region.extend({
        initialize: function () {
            this.listenTo(Streamus.channels.foregroundArea.vent, 'shown', this._onForegroundAreaShown);
        },
        
        _onForegroundAreaShown: function() {
            this.show(new AppBarView());
        }
    });

    return AppBarRegion;
});