define([
    'foreground/view/leftPane/leftPaneView'
], function (LeftPaneView) {
    'use strict';

    var LeftPaneRegion = Backbone.Marionette.Region.extend({
        el: '#leftPaneRegion',
        
        initialize: function() {
            this.show(new LeftPaneView());
        }
    });

    return LeftPaneRegion;
});