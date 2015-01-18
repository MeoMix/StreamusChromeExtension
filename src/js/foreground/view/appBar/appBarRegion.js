define(function (require) {
    'use strict';

    var AppBarView = require('foreground/view/appBar/appBarView');

    var AppBarRegion = Marionette.Region.extend({
        initialize: function () {
            this.listenTo(Streamus.channels.foregroundArea.vent, 'rendered', this._onForegroundAreaRendered);
        },
        
        _onForegroundAreaRendered: function () {
            this.show(new AppBarView());
        }
    });

    return AppBarRegion;
});