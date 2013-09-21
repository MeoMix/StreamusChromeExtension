define([
    'folder'
], function (Folder) {
    'use strict';

    var Folders = Backbone.Collection.extend({
        model: Folder,
        
        getActiveFolder: function () {
            console.log("This:", this);
            return this.findWhere({ active: true });
        },
        
        initialize: function() {

            this.on('sync', function() {
                console.log("I synced");
            });

        }
    });

    return Folders;
});