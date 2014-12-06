define([
    'foreground/model/prompt',
    'foreground/view/prompt/editPlaylistView',
    'foreground/view/prompt/promptView'
], function (Prompt, EditPlaylistView, PromptView) {
    'use strict';
    
    var EditPlaylistPromptView = PromptView.extend({
        id: 'editPlaylistPrompt',

        initialize: function (options) {
            this.model = new Prompt({
                title: chrome.i18n.getMessage('editPlaylist'),
                submitButtonText: chrome.i18n.getMessage('update')
            });

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