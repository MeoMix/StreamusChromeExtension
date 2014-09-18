define([
    'foreground/model/prompt',
    'foreground/view/createPlaylistView',
    'foreground/view/prompt/promptView'
], function (Prompt, CreatePlaylistView, PromptView) {
    'use strict';
    
    var CreatePlaylistPromptView = PromptView.extend({
        initialize: function() {
            this.model = new Prompt({
                title: chrome.i18n.getMessage('createPlaylist'),
                okButtonText: chrome.i18n.getMessage('create'),
                view: new CreatePlaylistView()
            });
            
            PromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return CreatePlaylistPromptView;
});