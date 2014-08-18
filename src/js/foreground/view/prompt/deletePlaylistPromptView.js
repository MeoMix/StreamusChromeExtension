define([
    'foreground/model/genericPrompt',
    'foreground/view/deletePlaylistView',
    'foreground/view/prompt/genericPromptView'
], function (GenericPrompt, DeletePlaylistView, GenericPromptView) {
    'use strict';
    
    var Settings = Streamus.backgroundPage.Settings;
    
    var DeletePlaylistPromptView = GenericPromptView.extend({
        initialize: function (options) {
            this.model = new GenericPrompt({
                title: chrome.i18n.getMessage('deletePlaylist'),
                okButtonText: chrome.i18n.getMessage('delete'),
                view: new DeletePlaylistView({
                    model: options.playlist
                })
            });

            GenericPromptView.prototype.initialize.apply(this, arguments);
        },
        
        reminderDisabled: function() {
            return !Settings.get('remindDeletePlaylist');
        }
    });

    return DeletePlaylistPromptView;
});