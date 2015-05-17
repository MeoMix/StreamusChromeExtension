define(function (require) {
    'use strict';

    var ContextMenuItems = require('foreground/collection/contextMenu/contextMenuItems');

    var ContextMenu = Backbone.Model.extend({
        defaults: function() {
            return {
                top: 0,
                left: 0,
                //  Used to determine whether contextMenu display should flip as to not overflow container
                containerHeight: 0,
                containerWidth: 0,
                items: new ContextMenuItems()
            };
        },
        
        initialize: function() {
            this.listenTo(Streamus.channels.contextMenu.commands, 'reset:items', this._resetItems);
        },
        
        _resetItems: function (items) {
            this.get('items').reset(items);
        }
    });

    return ContextMenu;
});