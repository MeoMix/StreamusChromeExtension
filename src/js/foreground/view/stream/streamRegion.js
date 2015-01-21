define(function (require) {
    'use strict';

    var StreamView = require('foreground/view/stream/streamView');
    
    var StreamRegion = Marionette.Region.extend({
        initialize: function() {
            this.listenTo(Streamus.channels.foregroundArea.vent, 'rendered', this._onForegroundAreaRendered);
        },
        
        _onForegroundAreaRendered: function () {
            this.show(new StreamView({
                model: Streamus.backgroundPage.stream
            }));
        }
    });

    return StreamRegion;
});