define([
    'foreground/model/exportPlaylist',
    'foreground/model/dialog',
    'foreground/view/dialog/exportPlaylistView',
    'foreground/view/dialog/dialogView'
], function (ExportPlaylist, Dialog, ExportPlaylistView, DialogView) {
    'use strict';
    
    var ExportPlaylistDialogView = DialogView.extend({
        id: 'exportPlaylistDialog',

        initialize: function (options) {
            this.model = new Dialog({
                title: chrome.i18n.getMessage('exportPlaylist'),
                submitButtonText: chrome.i18n.getMessage('export')
            });

            this.contentView = new ExportPlaylistView({
                model: new ExportPlaylist({
                    playlist: options.playlist
                })
            });

            DialogView.prototype.initialize.apply(this, arguments);
        },

        onSubmit: function () {
            this.contentView.saveAndExport();
        }
    });

    return ExportPlaylistDialogView;
});