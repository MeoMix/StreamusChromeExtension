define([
    'foreground/view/rightBasePane/rightBasePaneView'
], function (RightBasePaneView) {
    'use strict';
    
    var Player = Streamus.backgroundPage.YouTubePlayer;

    var RightBasePaneRegion = Backbone.Marionette.Region.extend({
        //  TODO: I am required to use ID selector here until bug resolved: https://github.com/marionettejs/backbone.marionette/issues/1530
        el: '#right-base-pane-region',
        
        initialize: function() {
            this.show(new RightBasePaneView({
                model: Player
            }));
        }
    });

    return RightBasePaneRegion;
});