define(function (require) {
    'use strict';

    var ContextMenuItem = require('foreground/model/contextMenu/contextMenuItem');

    var ContextMenuItems = Backbone.Collection.extend({
        model: ContextMenuItem
    });

    return ContextMenuItems;
});