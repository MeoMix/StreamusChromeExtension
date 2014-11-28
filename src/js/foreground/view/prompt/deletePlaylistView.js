define([
    'text!template/prompt/deletePlaylist.html'
], function (DeletePlaylistTemplate) {
    'use strict';

    var DeletePlaylistView = Marionette.ItemView.extend({
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