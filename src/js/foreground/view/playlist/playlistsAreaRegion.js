define(function(require) {
    'use strict';

    var PlaylistsAreaView = require('foreground/view/playlist/playlistsAreaView');

    var PlaylistsAreaRegion = Marionette.Region.extend({
        signInManager: null,

        initialize: function() {
            this.signInManager = Streamus.backgroundPage.signInManager;

            this.listenTo(Streamus.channels.playlistsArea.commands, 'show:playlistsArea', this._showPlaylistsArea);
            this.listenTo(Streamus.channels.playlistsArea.commands, 'hide:playlistsArea', this._hidePlaylistsArea);
            this.listenTo(Streamus.channels.foregroundArea.vent, 'idle', this._onForegroundAreaIdle);
            this.listenTo(this.signInManager, 'change:signedInUser', this._onSignInManagerChangeSignedInUser);
        },

        //  PlaylistsAreaView isn't initially visible. So, it is OK to defer creation until idle.
        //  This ensures that initial rendering performance isn't hurt, but also allows for the view to be cached before needed.
        //  Caching the view allows for a snappier response when animating.
        _onForegroundAreaIdle: function () {
            var signedInUser = this.signInManager.get('signedInUser');
            if (signedInUser !== null) {
                this._createPlaylistsAreaView(signedInUser.get('playlists'));
            }
        },

        _showPlaylistsArea: function() {
            //  It's possibly that the user might want to show playlistsArea before it has been created (i.e. before Application is idle)
            //  If so, just create it now so that it can be shown.
            if (!this._playlistsAreaViewExists()) {
                var signedInUser = this.signInManager.get('signedInUser');
                this._createPlaylistsAreaView(signedInUser.get('playlists'));
            }

            this.currentView.show();
        },

        _hidePlaylistsArea: function() {
            //  A hide command can be emitted by the application when the user is not signed in. In this scenario, currentView doesn't exist.
            if (this._playlistsAreaViewExists()) {
                this.currentView.hide();
            }
        },
        
        //  Returns true if PlaylistsAreaView is currently shown in the region.
        _playlistsAreaViewExists: function() {
            return !_.isUndefined(this.currentView);
        },

        _createPlaylistsAreaView: function(playlists) {
            if (!this._playlistsAreaViewExists()) {
                var playlistsAreaView = new PlaylistsAreaView({
                    playlists: playlists
                });

                this.show(playlistsAreaView);
            }
        },
        
        //  Don't allow this view to be shown if the user is not signed in.
        _onSignInManagerChangeSignedInUser: function(model, signedInUser) {
            if (signedInUser !== null) {
                this.empty();
                this._createPlaylistsAreaView(signedInUser.get('playlists'));
            } else if (this._playlistsAreaViewExists()) {
                this.currentView.hide();
            }
        }
    });

    return PlaylistsAreaRegion;
});