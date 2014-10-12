define([
    'foreground/view/prompt/deletePlaylistPromptView'
], function (DeletePlaylistPromptView) {
    'use strict';

    var PlaylistAction = Backbone.Model.extend({
        deletePlaylist: function (playlist) {
            //  No need to notify if the playlist is empty.
            if (playlist.get('items').length === 0) {
                playlist.destroy();
            } else {
                this._showDeletePlaylistPrompt(playlist);
            }
        },
        
        _showDeletePlaylistPrompt: function(playlist) {
            Backbone.Wreqr.radio.channel('prompt').commands.trigger('show:prompt', DeletePlaylistPromptView, {
                playlist: playlist
            });
        }
    });

    return new PlaylistAction();
});