define([
    'foreground/model/contextMenu',
    'foreground/view/contextMenu/contextMenuView'
], function (ContextMenu, ContextMenuView) {
    'use strict';

    var ContextMenuRegion = Backbone.Marionette.Region.extend({
        el: '#foregroundArea-contextMenuRegion',
        
        contextMenu: null,

        initialize: function () {
            this.contextMenu = new ContextMenu();
        },

        //  If a click occurs and the default isn't prevented, reset the context menu groups to hide it.
        //  Child elements will call event.preventDefault() to indicate that they have handled the context menu.
        handleClickEvent: function (event) {
            if (event.isDefaultPrevented()) {
                //  Show the element just slightly offset as to not break onHover effects.
                this._showContextMenu(event.pageY, event.pageX + 1);
            } else {
                this._hideContextMenu();
            }
        },
        
        _showContextMenu: function (top, left) {
            //  TODO: There's a bug in Marionette where this.$el.height/width return null on first use, so I'm using being inefficient here for now.
            var $this = $(this.el);

            this.contextMenu.set({
                top: top,
                left: left
            });

            this.show(new ContextMenuView({
                collection: this.contextMenu.get('items'),
                model: this.contextMenu,
                containerHeight: $this.height(),
                containerWidth: $this.width()
                //containerHeight: this.$el.height(),
                //containerWidth: this.$el.width()
            }));
        },
        
        _hideContextMenu: function() {
            this.contextMenu.get('items').reset();
            this.empty();
        }
    });

    return ContextMenuRegion;
});