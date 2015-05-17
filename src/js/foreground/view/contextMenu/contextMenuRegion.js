define(function(require) {
    'use strict';

    var ContextMenu = require('foreground/model/contextMenu/contextMenu');
    var ContextMenuView = require('foreground/view/contextMenu/contextMenuView');

    var ContextMenuRegion = Marionette.Region.extend({
        contextMenu: null,

        initialize: function() {
            this.contextMenu = new ContextMenu();

            this.listenTo(Streamus.channels.element.vent, 'drag', this._onElementDrag);
            this.listenTo(Streamus.channels.element.vent, 'click', this._onElementClick);
            this.listenTo(Streamus.channels.element.vent, 'contextMenu', this._onElementContextMenu);
        },

        _onElementDrag: function() {
            this._hideContextMenu();
        },

        _onElementClick: function() {
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

        _showContextMenu: function(top, left) {
            //  this.$el.height/width is null on first use, https://github.com/marionettejs/backbone.marionette/issues/1971.
            var $this = $(this.el);

            this.contextMenu.set({
                top: top,
                left: left,
                containerHeight: $this.height(),
                containerWidth: $this.width()
            });

            this.show(new ContextMenuView({
                model: this.contextMenu
            }));
        },

        _hideContextMenu: function() {
            if (this.currentView) {
                this.currentView.hide();
            }
        }
    });

    return ContextMenuRegion;
});