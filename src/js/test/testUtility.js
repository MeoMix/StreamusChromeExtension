define(function(require) {
    'use strict';

    var Song = require('background/model/song');
    var Playlist = require('background/model/playlist');
    var PlaylistItem = require('background/model/playlistItem');

    var TestUtility = {
        songIdLength: 7,

        _getUniqueId: function (idLength) {
            var text = '';
            var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

            for (var i = 0; i < idLength; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));

            return text;
        },

        getSongArray: function (length) {
            var songArray = [];

            for (var i = 0; i < length; i++) {
                songArray.push(this.buildSong(this._getUniqueId(this.songIdLength)));
            }

            return songArray;
        },

        getRawSong: function (idOverride) {
            var id = _.isUndefined(idOverride) ? 'M7lc1UVf-VE' : idOverride;

            return {
                id: id,
                title: 'YouTube Developers Live: Embedded Web Player Customization',
                author: 'Google Developers',
                duration: '1344'
            };
        },

        //  Construct a basic Song object fit for general testing.
        buildSong: function (idOverride) {
            return new Song(this.getRawSong(idOverride));
        },

        //  Construct a basic PlaylistItem object fit for general testing.
        buildPlaylistItem: function () {
            var song = this.buildSong();

            return new PlaylistItem({
                song: song,
                title: song.get('title')
            });
        },

        buildPlaylist: function () {
            return new Playlist({
                title: 'Playlist'
            });
        }
    };

    return TestUtility;
});