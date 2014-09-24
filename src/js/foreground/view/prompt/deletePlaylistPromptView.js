define([
    'foreground/model/prompt',
    'foreground/view/prompt/deletePlaylistView',
    'foreground/view/prompt/promptView'
], function (Prompt, DeletePlaylistView, PromptView) {
    'use strict';
    
    var DeletePlaylistPromptView = PromptView.extend({
        model: new Prompt({
            title: chrome.i18n.getMessage('deletePlaylist'),
            okButtonText: chrome.i18n.getMessage('delete'),
            reminderProperty: 'remindDeletePlaylist'
        }),

        initialize: function (options) {
            this.contentView = new DeletePlaylistView({
                model: options.playlist
            });

            PromptView.prototype.initialize.apply(this, arguments);
        },
        
        onSubmit: function () {
            this.contentView.deletePlaylist();
        }
    });

    return DeletePlaylistPromptView;
});