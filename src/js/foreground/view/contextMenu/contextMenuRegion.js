define([
    'foreground/model/contextMenu',
    'foreground/view/contextMenu/contextMenuView'
], function (ContextMenu, ContextMenuView) {
    'use strict';

    var ContextMenuRegion = Marionette.Region.extend({
        contextMenu: null,

        initialize: function () {
            this.contextMenu = new ContextMenu();
            
            this.listenTo(Streamus.channels.element.vent, 'drag', this._onElementDrag);
            this.listenTo(Streamus.channels.element.vent, 'click', this._onElementClick);
            this.listenTo(Streamus.channels.element.vent, 'contextMenu', this._onElementContextMenu);
        },
        
        _onElementDrag: function () {
            this._hideContextMenu();
        },
        
        _onElementClick: function () {
            this._hideContextMenu();
        },
        
        //  If a click occurs and the default isn't prevented, reset the context menu groups to hide it.
        //  Child elements will call event.preventDefault() to indicate that they have handled the context menu.
        _onElementContextMenu: function(event) {
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
            }));
        },
        
        _hideContextMenu: function () {
            if (this.currentView) {
                this.currentView.hide();
            }
        }
    });

    return ContextMenuRegion;
});