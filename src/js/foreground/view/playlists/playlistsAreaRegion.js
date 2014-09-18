define([
    'foreground/view/playlists/playlistsAreaView'
], function (PlaylistsAreaView) {
    'use strict';
    
    var Playlists = Streamus.backgroundPage.Playlists;

    var PlaylistsAreaRegion = Backbone.Marionette.Region.extend({
        el: '.region-playlistsArea',
        
        initialize: function () {
            this.listenTo(Backbone.Wreqr.radio.channel('global').vent, 'showPlaylistsArea', this._showPlaylistsAreaView);
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
                collection: Playlists
            });
            
            this.show(playlistsAreaView);
        }
    });

    return PlaylistsAreaRegion;
});