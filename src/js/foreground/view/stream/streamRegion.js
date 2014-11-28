define([
    'foreground/view/stream/streamView'
], function (StreamView) {
    'use strict';
    
    var StreamRegion = Marionette.Region.extend({
        initialize: function() {
            this.listenTo(Streamus.channels.foregroundArea.vent, 'shown', this._onForegroundAreaShown);
        },
        
        _onForegroundAreaShown: function () {
            this.show(new StreamView({
                model: Streamus.backgroundPage.stream
            }));
        }
    });

    return StreamRegion;
});