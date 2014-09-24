define([
    'foreground/model/prompt',
    'foreground/view/prompt/createPlaylistView',
    'foreground/view/prompt/promptView'
], function (Prompt, CreatePlaylistView, PromptView) {
    'use strict';
    
    var CreatePlaylistPromptView = PromptView.extend({
        model: new Prompt({
            title: chrome.i18n.getMessage('createPlaylist'),
            okButtonText: chrome.i18n.getMessage('create')
        }),

        initialize: function() {
            this.contentView = new CreatePlaylistView();
            
            PromptView.prototype.initialize.apply(this, arguments);
        }, 
        
        onSubmit: function () {
            this.contentView.createPlaylist();
        }
    });

    return CreatePlaylistPromptView;
});