define([
    'foreground/model/genericPrompt',
    'foreground/view/createPlaylistView',
    'foreground/view/prompt/genericPromptView'
], function (GenericPrompt, CreatePlaylistView, GenericPromptView) {
    'use strict';
    
    var CreatePlaylistPromptView = GenericPromptView.extend({
        model: null,
        
        initialize: function() {
            this.model = new GenericPrompt({
                title: chrome.i18n.getMessage('createPlaylist'),
                okButtonText: chrome.i18n.getMessage('create'),
                view: new CreatePlaylistView()
            });
            
            GenericPromptView.prototype.initialize.call(this, arguments);
        }
    });

    return CreatePlaylistPromptView;
});