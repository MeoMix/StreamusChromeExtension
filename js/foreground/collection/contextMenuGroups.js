define([
    'contextMenuGroup'
], function (ContextMenuGroup) {
    'use strict';

    var ContextMenuGroups = Backbone.Collection.extend({
        model: ContextMenuGroup,
        
        comparator: function(group) {
            return group.get('position');
        }
    });

    return ContextMenuGroups;
});