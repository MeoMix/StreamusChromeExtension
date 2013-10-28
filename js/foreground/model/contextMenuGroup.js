define([
    'contextMenuItems'
], function (ContextMenuItems) {
    'use strict';

    var ContextMenuGroup = Backbone.Model.extend({
        defaults: function () {
            return {
                items: new ContextMenuItems
            };
        },
        
        initialize: function() {
            var items = this.get('items');

            if (!(items instanceof Backbone.Collection)) {
                items = new ContextMenuItems(items);

                this.set('items', items, {
                    //  Silent operation because items isn't technically changing - just being made correct.
                    silent: true
                });
            }
        }
    });

    return ContextMenuGroup;
});