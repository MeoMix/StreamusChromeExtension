define([
    'foreground/model/dialog',
    'foreground/view/dialog/editPlaylistView',
    'foreground/view/dialog/dialogView'
], function (Dialog, EditPlaylistView, DialogView) {
    'use strict';
    
    var EditPlaylistDialogView = DialogView.extend({
        id: 'editPlaylistDialog',

        initialize: function (options) {
            this.model = new Dialog({
                title: chrome.i18n.getMessage('editPlaylist'),
                submitButtonText: chrome.i18n.getMessage('update')
            });

            this.contentView = new EditPlaylistView({
                model: options.playlist
            });
            
            DialogView.prototype.initialize.apply(this, arguments);
        },
        
        onSubmit: function() {
            this.contentView.editPlaylist();
        }
    });

    return EditPlaylistDialogView;
});