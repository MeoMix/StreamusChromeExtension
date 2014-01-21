define([
    'foreground/view/prompt/genericPromptView',
    'foreground/view/createPlaylistView'
], function (GenericPromptView, CreatePlaylistView) {
    'use strict';
    
    var CreatePlaylistPromptView = GenericPromptView.extend({
        title: chrome.i18n.getMessage('createPlaylist'),
        
        okButtonText: chrome.i18n.getMessage('create'),
        
        model: new CreatePlaylistView()
    });

    return CreatePlaylistPromptView;
});