define([
    'foreground/view/behavior/tooltip',
    'foreground/view/listItemButton/listItemButtonsView'
], function (Tooltip, ListItemButtonsView) {
    'use strict';

    var ListItemView = Backbone.Marionette.LayoutView.extend({
        tagName: 'li',
        className: 'listItem',
        
        attributes: function () {
            return {
                'data-id': this.model.get('id'),
                'data-type': this.options.type
            };
        },

        ui: {
            buttonsRegion: '.listItem-buttonsRegion'
        },

        events: {
            'contextmenu': '_showContextMenu',
            'mouseenter': '_onMouseEnter',
            'mouseleave': '_onMouseLeave'
        },
        
        regions: {
            buttonsRegion: '@ui.buttonsRegion'
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },
        
        _onMouseEnter: function () {
            this.buttonsRegion.show(new ListItemButtonsView({
                model: this.model,
                buttonViews: this.buttonViews
            }));
        },

        _onMouseLeave: function () {
            this.buttonsRegion.empty();
        }
    });

    return ListItemView;
});