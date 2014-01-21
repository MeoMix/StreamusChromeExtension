define([
    'foreground/view/prompt/genericPromptView',
    'foreground/view/deletePlaylistView',
    'foreground/model/settings'
], function (GenericPromptView, DeletePlaylistView, Settings) {
    'use strict';
    
    var DeletePlaylistPromptView = GenericPromptView.extend({
        title: chrome.i18n.getMessage('deletePlaylist'),
        
        okButtonText: chrome.i18n.getMessage('delete'),
        
        model: null,
        
        initialize: function (options) {

            this.model = new DeletePlaylistView({
                model: options.playlist
            });

            GenericPromptView.prototype.initialize.call(this, arguments);
        },
        
        //  TODO: The name of this function doesn't indicate that it won't show if reminder is disabled.
        fadeInAndShow: function () {
            
            var remindDeletePlaylist = Settings.get('remindDeletePlaylist');
            if (remindDeletePlaylist) {
                return GenericPromptView.prototype.fadeInAndShow.call(this, arguments);
            } else {
                this.model.model.destroy();
            }
            
        }
    });

    return DeletePlaylistPromptView;
});