define(function(require) {
    'use strict';

    var CreatePlaylistDialogView = require('foreground/view/dialog/createPlaylistDialogView');

    var SongsAction = Backbone.Model.extend({
        defaults: function() {
            return {
                songs: []
            };
        },

        showSaveMenu: function(top, left, playlists) {
            var simpleMenuItems = playlists.map(function(playlist) {
                return {
                    active: playlist.get('active'),
                    text: playlist.get('title'),
                    value: playlist.get('id'),
                    onClick: function(model) {
                        var playlistId = model.get('value');
                        playlists.get(playlistId).get('items').addSongs(this.get('songs'));
                    }.bind(this)
                };
            }, this);

            Streamus.channels.simpleMenu.commands.trigger('show:simpleMenu', {
                top: top,
                left: left,
                simpleMenuItems: simpleMenuItems,
                fixedMenuItem: {
                    text: chrome.i18n.getMessage('createPlaylist'),
                    onClick: function() {
                        Streamus.channels.dialog.commands.trigger('show:dialog', CreatePlaylistDialogView, {
                            songs: this.get('songs')
                        });
                    }.bind(this)
                }
            });
        }
    });

    return SongsAction;
});