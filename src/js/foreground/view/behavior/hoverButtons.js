define([
    'foreground/view/listItemButtonsView'
], function(ListItemButtonsView) {
    'use strict';

    var HoverButtons = Backbone.Marionette.Behavior.extend({
        events: {
            'mouseenter': '_onMouseEnter',
            'mouseleave': '_onMouseLeave'
        },

        _onMouseEnter: function () {
            //  TODO: Rename ListItemButtonsView to something more generic?
            this.view.buttonsRegion.show(new ListItemButtonsView({
                model: this.view.model,
                buttonViews: this.view.buttonViews
            }));
        },

        _onMouseLeave: function () {
            this.view.buttonsRegion.empty();
        }
    });

    return HoverButtons;
})