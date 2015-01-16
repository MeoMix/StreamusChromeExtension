define([
    'foreground/model/dialog',
    'foreground/view/dialog/deletePlaylistView',
    'foreground/view/dialog/dialogView'
], function (Dialog, DeletePlaylistView, DialogView) {
    'use strict';
    
    var DeletePlaylistDialogView = DialogView.extend({
        id: 'deletePlaylistDialog',

        initialize: function (options) {
            this.model = new Dialog({
                title: chrome.i18n.getMessage('deletePlaylist'),
                submitButtonText: chrome.i18n.getMessage('delete'),
                reminderProperty: 'remindDeletePlaylist'
            });

            this.contentView = new DeletePlaylistView({
                model: options.playlist
            });

            DialogView.prototype.initialize.apply(this, arguments);
        },
        
        onSubmit: function () {
            this.contentView.deletePlaylist();
        }
    });

    return DeletePlaylistDialogView;
});