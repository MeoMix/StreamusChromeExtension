define([
    'contextMenuGroups'
], function (ContextMenuGroups) {
    'use strict';

    var ContextMenu = Backbone.Model.extend({
        defaults: function () {
            return {
                groups: new ContextMenuGroups
            };
        },
        
        initialize: function () {
            var groups = this.get('groups');

            if (!(groups instanceof Backbone.Collection)) {
                groups = new ContextMenuGroups(groups);

                this.set('groups', groups, {
                    //  Silent operation because groups isn't technically changing - just being made correct.
                    silent: true
                });
            }
        }
    });

    return ContextMenu;
});