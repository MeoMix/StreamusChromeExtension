define([
    'foreground/view/leftBasePane/leftBasePaneView'
], function (LeftBasePaneView) {
    'use strict';

    var LeftBasePaneRegion = Backbone.Marionette.Region.extend({
        el: '#left-base-pane-region',
        
        initialize: function() {
            this.show(new LeftBasePaneView());
        }
    });

    return LeftBasePaneRegion;
});