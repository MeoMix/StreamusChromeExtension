define(function (require) {
    'use strict';

    var DeletePlaylistDialogView = require('foreground/view/dialog/deletePlaylistDialogView');

    var PlaylistAction = Backbone.Model.extend({
        defaults: {
            playlist: null
        },

        deletePlaylist: function () {
            //  No need to notify if the playlist is empty.
            if (this.get('playlist').get('items').length === 0) {
                this.get('playlist').destroy();
            } else {
                this._showDeletePlaylistDialog();
            }
        },
        
        _showDeletePlaylistDialog: function() {
            Streamus.channels.dialog.commands.trigger('show:dialog', DeletePlaylistDialogView, {
                playlist: this.get('playlist')
            });
        }
    });

    return PlaylistAction;
});