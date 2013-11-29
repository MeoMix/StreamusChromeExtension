var Folders;

define([
    'folder'
], function (Folder) {
    'use strict';

    var FolderCollection = Backbone.Collection.extend({
        model: Folder,
        
        getActiveFolder: function () {
            return this.findWhere({ active: true });
        }
 
    });

    Folders = new FolderCollection;
    return Folders;
});