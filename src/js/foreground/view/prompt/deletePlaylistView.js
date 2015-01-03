define([
    'foreground/view/prompt/promptContentView',
    'text!template/prompt/deletePlaylist.html'
], function (PromptContentView, DeletePlaylistTemplate) {
    'use strict';

    var DeletePlaylistView = PromptContentView.extend({
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