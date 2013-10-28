define([
    'contextMenuGroup'
], function (ContextMenuGroup) {
    'use strict';

    var ContextMenuGroups = Backbone.Collection.extend({
        model: ContextMenuGroup
    });

    return new ContextMenuGroups;
});