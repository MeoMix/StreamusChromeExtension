define([
    'foreground/model/genericPrompt',
    'foreground/view/prompt/genericPromptView',
    'foreground/view/createPlaylistView'
], function (GenericPrompt, GenericPromptView, CreatePlaylistView) {
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