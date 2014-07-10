define([
    'foreground/view/rightBasePane/rightBasePaneView'
], function (RightBasePaneView) {
    'use strict';
    
    var Player = chrome.extension.getBackgroundPage().YouTubePlayer;

    var RightBasePaneRegion = Backbone.Marionette.Region.extend({
        el: '#right-base-pane-region',
        
        initialize: function() {
            this.show(new RightBasePaneView({
                model: Player
            }));
        }
    });

    return RightBasePaneRegion;
});