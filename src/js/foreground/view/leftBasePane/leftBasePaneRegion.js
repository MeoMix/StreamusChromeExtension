define([
    'foreground/view/leftBasePane/leftBasePaneView'
], function (LeftBasePaneView) {
    'use strict';

    var LeftBasePaneRegion = Backbone.Marionette.Region.extend({
        el: '.region-leftPane',
        
        initialize: function() {
            this.show(new LeftBasePaneView());
        }
    });

    return LeftBasePaneRegion;
});