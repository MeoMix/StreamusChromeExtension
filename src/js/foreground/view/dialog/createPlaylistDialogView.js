define([
    'foreground/model/dialog',
    'foreground/view/dialog/createPlaylistView',
    'foreground/view/dialog/dialogView'
], function (Dialog, CreatePlaylistView, DialogView) {
    'use strict';
    
    var CreatePlaylistDialogView = DialogView.extend({
        id: 'createPlaylistDialog',

        initialize: function (options) {
            this.model = new Dialog({
                title: chrome.i18n.getMessage('createPlaylist'),
                submitButtonText: chrome.i18n.getMessage('create')
            });

            this.contentView = new CreatePlaylistView({
                songs: options && options.songs ? options.songs : []
            });
            
            DialogView.prototype.initialize.apply(this, arguments);
        }, 
        
        onSubmit: function () {
            this.contentView.createPlaylist();
        }
    });

    return CreatePlaylistDialogView;
});