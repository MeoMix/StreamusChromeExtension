define([
    'foreground/model/genericPrompt',
    'foreground/view/prompt/genericPromptView',
    'foreground/view/deletePlaylistView',
    'background/model/settings'
], function (GenericPrompt, GenericPromptView, DeletePlaylistView, Settings) {
    'use strict';
    
    var DeletePlaylistPromptView = GenericPromptView.extend({
        model: null,
        
        initialize: function (options) {

            this.model = new GenericPrompt({
                title: chrome.i18n.getMessage('deletePlaylist'),
                okButtonText: chrome.i18n.getMessage('delete'),
                view: new DeletePlaylistView({
                    model: options.playlist
                })
            });

            GenericPromptView.prototype.initialize.call(this, arguments);
        },
        
        //  TODO: The name of this function doesn't indicate that it won't show if reminder is disabled.
        fadeInAndShow: function () {
            
            var remindDeletePlaylist = Settings.get('remindDeletePlaylist');
            if (remindDeletePlaylist) {
                return GenericPromptView.prototype.fadeInAndShow.call(this, arguments);
            } else {
                this.model.get('view').doOk();
            }
            
        }
    });

    return DeletePlaylistPromptView;
});