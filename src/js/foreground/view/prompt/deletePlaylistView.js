define([
    'text!template/prompt/deletePlaylist.html'
], function (DeletePlaylistTemplate) {
    'use strict';

    var DeletePlaylistView = Backbone.Marionette.ItemView.extend({
        template: _.template(DeletePlaylistTemplate),
        
        templateHelpers: {
            areYouSureYouWantToDeletePlaylistMessage: chrome.i18n.getMessage('areYouSureYouWantToDeletePlaylist')
        },
        
        deletePlaylist: function() {
            this.model.destroy();
        }
    });

    return DeletePlaylistView;
});