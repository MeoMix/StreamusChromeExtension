define([
    'foreground/model/prompt',
    'foreground/view/prompt/createPlaylistView',
    'foreground/view/prompt/promptView'
], function (Prompt, CreatePlaylistView, PromptView) {
    'use strict';
    
    var CreatePlaylistPromptView = PromptView.extend({
        id: 'createPlaylistPrompt',

        initialize: function () {
            this.model = new Prompt({
                title: chrome.i18n.getMessage('createPlaylist'),
                submitButtonText: chrome.i18n.getMessage('create')
            });

            this.contentView = new CreatePlaylistView();
            
            PromptView.prototype.initialize.apply(this, arguments);
        }, 
        
        onSubmit: function () {
            this.contentView.createPlaylist();
        }
    });

    return CreatePlaylistPromptView;
});