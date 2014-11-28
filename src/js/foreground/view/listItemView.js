define([
    'foreground/view/behavior/tooltip',
    'foreground/view/listItemButton/listItemButtonsView'
], function (Tooltip, ListItemButtonsView) {
    'use strict';

    var ListItemView = Marionette.LayoutView.extend({
        tagName: 'li',
        className: 'listItem',
        
        attributes: function () {
            return {
                'data-id': this.model.get('id'),
                'data-type': this.options.type,
                //  When a view is unloaded by slidingRender logic it loses track of its parent. This is able to be used to get a reference to it.
                'data-parentid': this.options.parentId
            };
        },

        events: {
            'contextmenu': '_onContextMenu',
            'mouseenter': '_onMouseEnter',
            'mouseleave': '_onMouseLeave'
        },
        
        regions: function () {
            return {
                buttonsRegion: '.' + ListItemView.prototype.className + '-buttonsRegion'
            };
        },
        
        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },
        
        _onContextMenu: function (event) {
            event.preventDefault();
            this.showContextMenu();
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