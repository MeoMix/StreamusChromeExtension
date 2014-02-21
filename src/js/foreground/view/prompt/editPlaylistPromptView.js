define([
    'foreground/model/genericPrompt',
    'foreground/view/prompt/genericPromptView',
    'foreground/view/editPlaylistView',
    'background/model/settings'
], function (GenericPrompt, GenericPromptView, EditPlaylistView) {
    'use strict';
    
    var EditPlaylistPromptView = GenericPromptView.extend({
        model: null,
        
        initialize: function (options) {

            this.model = new GenericPrompt({
                title: chrome.i18n.getMessage('editPlaylist'),
                okButtonText: chrome.i18n.getMessage('update'),
                view: new EditPlaylistView({
                    model: options.playlist
                })
            });
            
            GenericPromptView.prototype.initialize.call(this, arguments);
        }
    });

    return EditPlaylistPromptView;
});