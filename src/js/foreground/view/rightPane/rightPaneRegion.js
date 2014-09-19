define([
    'foreground/view/rightPane/rightPaneView'
], function (RightPaneView) {
    'use strict';
    
    var Player = Streamus.backgroundPage.YouTubePlayer;

    var RightPaneRegion = Backbone.Marionette.Region.extend({
        el: '#rightPaneRegion',
        
        initialize: function() {
            this.show(new RightPaneView({
                model: Player
            }));
        }
    });

    return RightPaneRegion;
});