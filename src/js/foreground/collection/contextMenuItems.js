define([
    'foreground/model/contextMenuItem'
], function (ContextMenuItem) {
    'use strict';

    var ContextMenuItems = Backbone.Collection.extend({
        model: ContextMenuItem
    });

    return new ContextMenuItems();
});