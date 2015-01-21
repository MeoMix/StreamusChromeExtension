define(function (require) {
    'use strict';

    var ContextMenuItems = require('foreground/collection/contextMenuItems');

    var ContextMenu = Backbone.Model.extend({
        defaults: function() {
            return {
                top: 0,
                left: 0,
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