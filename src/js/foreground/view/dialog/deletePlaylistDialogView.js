define(function(require) {
    'use strict';

    var Dialog = require('foreground/model/dialog/dialog');
    var DeletePlaylistView = require('foreground/view/dialog/deletePlaylistView');
    var DialogView = require('foreground/view/dialog/dialogView');

    var DeletePlaylistDialogView = DialogView.extend({
        id: 'deletePlaylistDialog',

        initialize: function(options) {
            this.model = new Dialog({
                submitButtonText: chrome.i18n.getMessage('delete'),
                reminderProperty: 'remindDeletePlaylist'
            });

            this.contentView = new DeletePlaylistView({
                model: options.playlist
            });

            DialogView.prototype.initialize.apply(this, arguments);
        },

        onSubmit: function() {
            this.contentView.deletePlaylist();
        }
    });

    return DeletePlaylistDialogView;
});