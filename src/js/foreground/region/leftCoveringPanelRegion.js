define([
], function() {
    'use strict';

    var LeftCoveringPanelRegion = Backbone.Marionette.Region.extend({
        
        open: function (view) {
            console.log("leftCoveringPanelRegion open is being called");
            this.$el.empty().append(view.el);
        },
        
        //open: function (viewInstance, a, e) {

        //    console.log("Opening", viewInstance, a, e);

        //    //viewInstance.$el.children().clone(true).appendTo(this.$el);
        //}

        onShow: function () {
            console.log("onShow is running");
        }

    });

    return LeftCoveringPanelRegion;
})