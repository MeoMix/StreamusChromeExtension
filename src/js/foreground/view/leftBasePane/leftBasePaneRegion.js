define([
    'foreground/view/leftBasePane/leftBasePaneView'
], function (LeftBasePaneView) {
    'use strict';

    var LeftBasePaneRegion = Backbone.Marionette.Region.extend({
        //  TODO: I am required to use ID selector here until bug resolved: https://github.com/marionettejs/backbone.marionette/issues/1530
        el: '.region.left-pane.base',
        
        initialize: function() {
            this.show(new LeftBasePaneView());
        }
    });

    return LeftBasePaneRegion;
});