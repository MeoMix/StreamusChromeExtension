define([
    'foreground/model/prompt',
    'foreground/view/prompt/editPlaylistView',
    'foreground/view/prompt/promptView'
], function (Prompt, EditPlaylistView, PromptView) {
    'use strict';
    
    var EditPlaylistPromptView = PromptView.extend({
        model: new Prompt({
            title: chrome.i18n.getMessage('editPlaylist'),
            okButtonText: chrome.i18n.getMessage('update')
        }),

        initialize: function (options) {
            this.contentView = new EditPlaylistView({
                model: options.playlist
            });
            
            PromptView.prototype.initialize.apply(this, arguments);
        },
        
        onSubmit: function() {
            this.contentView.editPlaylist();
        }
    });

    return EditPlaylistPromptView;
});