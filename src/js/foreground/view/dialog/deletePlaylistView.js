define([
    'foreground/view/dialog/dialogContentView',
    'text!template/dialog/deletePlaylist.html'
], function (DialogContentView, DeletePlaylistTemplate) {
    'use strict';

    var DeletePlaylistView = DialogContentView.extend({
        template: _.template(DeletePlaylistTemplate),
        
        templateHelpers: {
            deleteMessage: chrome.i18n.getMessage('delete')
        },
        
        deletePlaylist: function() {
            this.model.destroy();
        }
    });

    return DeletePlaylistView;
});