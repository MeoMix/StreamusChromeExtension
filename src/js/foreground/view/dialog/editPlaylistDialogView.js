define(function(require) {
    'use strict';

    var Dialog = require('foreground/model/dialog/dialog');
    var EditPlaylistView = require('foreground/view/dialog/editPlaylistView');
    var DialogView = require('foreground/view/dialog/dialogView');

    var EditPlaylistDialogView = DialogView.extend({
        id: 'editPlaylistDialog',

        initialize: function(options) {
            this.model = new Dialog({
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