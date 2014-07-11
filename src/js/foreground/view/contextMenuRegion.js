define([
    'foreground/collection/contextMenuItems',
    'foreground/model/contextMenu',
    'foreground/view/contextMenuView'
], function (ContextMenuItems, ContextMenu, ContextMenuView) {
    'use strict';

    var ContextMenuRegion = Backbone.Marionette.Region.extend({
        el: '#context-menu-region',
        containerHeight: 0,
        containerWidth: 0,
        
        initialize: function (options) {
            this.containerHeight = options && options.containerHeight ? options.containerHeight : this.containerHeight;
            this.containerWidth = options && options.containerWidth ? options.containerWidth : this.containerWidth;

            if (this.containerHeight <= 0 || this.containerWidth <= 0) throw new Error('ContextMenuRegion expects containerHeight and containerWidth to be set');
        },
        
        //  If a click occurs and the default isn't prevented, reset the context menu groups to hide it.
        //  Child elements will call event.preventDefault() to indicate that they have handled the context menu.
        handleClickEvent: function (event) {
            event.isDefaultPrevented() ? this._showContextMenu() : this._hideContextMenu();
        },
        
        _showContextMenu: function() {
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
        
        _hideContextMenu: function() {
            ContextMenuItems.reset();
            this.empty();
        }
    });

    return ContextMenuRegion;
});