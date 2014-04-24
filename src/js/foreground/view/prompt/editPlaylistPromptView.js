define([
    'foreground/model/genericPrompt',
    'foreground/view/editPlaylistView',
    'foreground/view/prompt/genericPromptView'
], function (GenericPrompt, EditPlaylistView, GenericPromptView) {
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
            
            GenericPromptView.prototype.initialize.apply(this, arguments);
        }
    });

    return EditPlaylistPromptView;
});