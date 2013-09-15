define([
    'contextMenuItem'
], function (ContextMenuItem) {
    'use strict';

    var ContextMenuItems = Backbone.Collection.extend({
        model: ContextMenuItem,
        
        comparator: function(item) {
            return item.get('position');
        }
    });

    return ContextMenuItems;
});