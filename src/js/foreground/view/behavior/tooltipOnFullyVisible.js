define(function() {
    'use strict';

    var TooltipOnFullyVisible = Backbone.Marionette.Behavior.extend({
        fullyVisible: false,

        onFullyVisible: function() {
            this.fullyVisible = true;
            
            this.view.children.each(function (child) {
                child.setTitleTooltip(child.ui.title);
            });
        },

        onAfterItemAdded: function(view) {
            if (this.fullyVisible) {
                view.setTitleTooltip(view.ui.title);
            }
        }
    });

    return TooltipOnFullyVisible;
});