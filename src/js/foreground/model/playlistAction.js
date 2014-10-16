define([
    'foreground/view/prompt/deletePlaylistPromptView'
], function (DeletePlaylistPromptView) {
    'use strict';

    var PlaylistAction = Backbone.Model.extend({
        defaults: {
            playlist: null
        },

        deletePlaylist: function () {
            //  No need to notify if the playlist is empty.
            if (this.get('playlist').get('items').length === 0) {
                this.get('playlist').destroy();
            } else {
                this._showDeletePlaylistPrompt();
            }
        },
        
        _showDeletePlaylistPrompt: function() {
            Streamus.channels.prompt.commands.trigger('show:prompt', DeletePlaylistPromptView, {
                playlist: this.get('playlist')
            });
        }
    });

    return PlaylistAction;
});