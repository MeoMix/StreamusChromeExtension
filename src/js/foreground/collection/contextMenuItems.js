define(function (require) {
    'use strict';

    var ContextMenuItem = require('foreground/model/contextMenuItem');

    var ContextMenuItems = Backbone.Collection.extend({
        model: ContextMenuItem
    });

    return ContextMenuItems;
});