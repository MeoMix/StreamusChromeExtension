define([
    'foreground/collection/contextMenuItems',
    'foreground/model/contextMenu',
    'foreground/view/contextMenuView'
], function (ContextMenuItems, ContextMenu, ContextMenuView) {
    'use strict';

    var ContextMenuRegion = Backbone.Marionette.Region.extend({
        el: '#context-menu-region',
        
        //  TODO: How can I pass these values in from Foreground?
        containerHeight: $('body').height(),
        containerWidth: $('body').width(),
        
        //  If a click occurs and the default isn't prevented, reset the context menu groups to hide it.
        //  Child elements will call event.preventDefault() to indicate that they have handled the context menu.
        handleClickEvent: function (event) {
            event.isDefaultPrevented() ? this.showContextMenu() : this.hideContextMenu();
        },
        
        showContextMenu: function() {
            this.show(new ContextMenuView({
                collection: ContextMenuItems,
                model: new ContextMenu({
                    top: event.pageY,
                    //  Show the element just slightly offset as to not break onHover effects.
                    left: event.pageX + 1
                }),
                containerHeight: this.containerHeight,
                containerWidth: this.containerWidth
            }));
        },
        
        hideContextMenu: function() {
            ContextMenuItems.reset();
            this.empty();
        }
    });

    return ContextMenuRegion;
});