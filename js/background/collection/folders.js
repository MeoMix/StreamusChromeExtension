var Folders;

define([
    'folder'
], function (Folder) {
    'use strict';

    var folderCollection = Backbone.Collection.extend({
        model: Folder,
        
        getActiveFolder: function () {
            return this.findWhere({ active: true });
        }
 
    });

    Folders = new folderCollection;

    return Folders;
});