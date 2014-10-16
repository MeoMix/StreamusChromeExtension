define([
    'foreground/view/playlist/playlistsAreaView'
], function (PlaylistsAreaView) {
    'use strict';
    
    var PlaylistsAreaRegion = Backbone.Marionette.Region.extend({
        el: '#foregroundArea-playlistsAreaRegion',
        
        initialize: function () {
            this.listenTo(Streamus.channels.global.vent, 'showPlaylistsArea', this._showPlaylistsAreaView);
        },
        
        _showPlaylistsAreaView: function () {
            if (!this._playlistsAreaViewExists()) {
                this._createPlaylistsAreaView();
            }
        },
        
        //  Returns true if PlaylistsAreaView is currently shown
        _playlistsAreaViewExists: function () {
            return !_.isUndefined(this.currentView) && this.currentView instanceof PlaylistsAreaView;
        },
        
        _createPlaylistsAreaView: function() {
            var playlistsAreaView = new PlaylistsAreaView({
                collection: Streamus.backgroundPage.Playlists
            });
            
            this.show(playlistsAreaView);
        }
    });

    return PlaylistsAreaRegion;
});