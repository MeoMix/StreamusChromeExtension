define(function (require) {
    'use strict';

    var ExportPlaylist = require('foreground/model/exportPlaylist');
    var Dialog = require('foreground/model/dialog');
    var ExportPlaylistView = require('foreground/view/dialog/exportPlaylistView');
    var DialogView = require('foreground/view/dialog/dialogView');
    
    var ExportPlaylistDialogView = DialogView.extend({
        id: 'exportPlaylistDialog',

        initialize: function (options) {
            this.model = new Dialog({
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