define([
    'foreground/view/playlist/playlistsAreaView'
], function (PlaylistsAreaView) {
    'use strict';
    
    var PlaylistsAreaRegion = Backbone.Marionette.Region.extend({
        el: '#foregroundArea-playlistsAreaRegion',
        signInManager: null,
        
        initialize: function () {
            this.signInManager = Streamus.backgroundPage.signInManager;

            this.listenTo(Streamus.channels.playlistsArea.commands, 'show', this._showPlaylistsAreaView);
            this.listenTo(Streamus.channels.foregroundArea.vent, 'shown', this._onForegroundAreaShown);
            this.listenTo(this.signInManager, 'change:signedInUser', this._onSignInManagerChangeSignedInUser);
        },
        
        _onForegroundAreaShown: function () {
            var signedInUser = this.signInManager.get('signedInUser');
            if (signedInUser !== null) {
                this._createPlaylistsAreaView(signedInUser.get('playlists'));
            }
        },
        
        _showPlaylistsAreaView: function () {
            this.currentView.show();
        },
        
        //  Returns true if PlaylistsAreaView is currently shown
        _playlistsAreaViewExists: function () {
            return !_.isUndefined(this.currentView) && this.currentView instanceof PlaylistsAreaView;
        },
        
        _createPlaylistsAreaView: function (playlists) {
            if (!this._playlistsAreaViewExists()) {
                var playlistsAreaView = new PlaylistsAreaView({
                    collection: playlists
                });

                this.show(playlistsAreaView);
            }
        },
        
        //  Don't allow this view to be shown if the user is not signed in.
        _onSignInManagerChangeSignedInUser: function (model, signedInUser) {
            if (signedInUser !== null) {
                this._createPlaylistsAreaView(signedInUser.get('playlists'));
            } else if (this._playlistsAreaViewExists()) {
                this.currentView.hide();
            }
        }
    });

    return PlaylistsAreaRegion;
});