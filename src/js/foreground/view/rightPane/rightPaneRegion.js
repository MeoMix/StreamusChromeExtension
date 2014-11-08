define([
    'foreground/view/rightPane/rightPaneView'
], function (RightPaneView) {
    'use strict';
    
    var RightPaneRegion = Backbone.Marionette.Region.extend({
        el: '#foregroundArea-rightPaneRegion',
        
        initialize: function() {
            this.listenTo(Streamus.channels.foregroundArea.vent, 'shown', this._onForegroundAreaShown);
        },
        
        _onForegroundAreaShown: function () {
            this.show(new RightPaneView());
        }
    });

    return RightPaneRegion;
});