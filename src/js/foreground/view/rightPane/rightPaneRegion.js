define([
    'foreground/view/rightPane/rightPaneView'
], function (RightPaneView) {
    'use strict';
    
    var Player = Streamus.backgroundPage.Player;

    var RightPaneRegion = Backbone.Marionette.Region.extend({
        el: '#foregroundArea-rightPaneRegion',
        
        initialize: function() {
            this.listenTo(Backbone.Wreqr.radio.channel('foregroundArea').vent, 'shown', this._onForegroundAreaShown);
        },
        
        _onForegroundAreaShown: function() {
            this.show(new RightPaneView({
                model: Player
            }));
        }
    });

    return RightPaneRegion;
});