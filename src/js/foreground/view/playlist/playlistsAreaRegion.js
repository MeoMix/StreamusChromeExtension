define(function (require) {
    'use strict';

    var PlaylistsAreaView = require('foreground/view/playlist/playlistsAreaView');
    
    var PlaylistsAreaRegion = Marionette.Region.extend({
        signInManager: null,
        
        initialize: function () {
            this.signInManager = Streamus.backgroundPage.signInManager;

            this.listenTo(Streamus.channels.playlistsArea.commands, 'show:playlistsArea', this._showPlaylistsArea);
            this.listenTo(Streamus.channels.playlistsArea.commands, 'hide:playlistsArea', this._hidePlaylistsArea);
            this.listenTo(Streamus.channels.foregroundArea.vent, 'shown', this._onForegroundAreaShown);
            this.listenTo(this.signInManager, 'change:signedInUser', this._onSignInManagerChangeSignedInUser);
        },
        
        _onForegroundAreaShown: function () {
            var signedInUser = this.signInManager.get('signedInUser');
            if (signedInUser !== null) {
                this._createPlaylistsAreaView(signedInUser.get('playlists'));
            }
        },
        
        _showPlaylistsArea: function () {
            this.currentView.show();
        },
        
        _hidePlaylistsArea: function () {
            //  A hide command can be emitted by the application when the user is not signed in. In this scenario, currentView doesn't exist.
            if (this._playlistsAreaViewExists()) {
                this.currentView.hide();
            }
        },
        
        //  Returns true if PlaylistsAreaView is currently shown
        _playlistsAreaViewExists: function () {
            return !_.isUndefined(this.currentView) && this.currentView instanceof PlaylistsAreaView;
        },
        
        _createPlaylistsAreaView: function (playlists) {
            if (!this._playlistsAreaViewExists()) {
                var playlistsAreaView = new PlaylistsAreaView({
                    playlists: playlists
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