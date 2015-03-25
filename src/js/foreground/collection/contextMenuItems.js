define(function (require) {
    'use strict';

    var ContextMenuItem = require('foreground/model/contextMenuItem');

    var ContextMenuItems = BackboneForeground.Collection.extend({
        model: ContextMenuItem
    });

    return ContextMenuItems;
});