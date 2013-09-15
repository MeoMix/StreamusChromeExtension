define([
    'folder'
], function (Folder) {
    'use strict';

    var Folders = Backbone.Collection.extend({
        model: Folder,
        
        getActiveFolder: function() {
            return this.findWhere({ active: true });
        }
    });

    return Folders;
});