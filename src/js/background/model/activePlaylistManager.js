define(function() {
  'use strict';

  // A de-normalization point for infering what the active playlist without needing to worry about
  // whether a user is signed in or not.
  var ActivePlaylistManager = Backbone.Model.extend({
    defaults: {
      activePlaylist: null,
      signInManager: null
    },

    initialize: function() {
      var signInManager = this.get('signInManager');
      this.listenTo(signInManager, 'change:signedInUser', this._onSignInManagerChangeSignedInUser);

      var signedInUser = signInManager.get('signedInUser');
      if (!_.isNull(signedInUser)) {
        this._setUserBindings(signedInUser, true);
      }

      this._setActivePlaylist(signedInUser);
    },

    _onSignInManagerChangeSignedInUser: function(signInManager, signedInUser) {
      if (_.isNull(signedInUser)) {
        var previousSignedInUser = signInManager.previous('signedInUser');

        if (!_.isNull(previousSignedInUser)) {
          this._setUserBindings(previousSignedInUser, false);
        }
      } else {
        this._setUserBindings(signedInUser, true);
      }

      this._setActivePlaylist(signedInUser);
    },

    _onPlaylistsChangeActive: function(playlist, active) {
      if (active) {
        this.set('activePlaylist', playlist);
      } else {
        if (this.get('activePlaylist') === playlist) {
          this.set('activePlaylist', null);
        }
      }
    },

    _setUserBindings: function(user, isBinding) {
      var playlists = user.get('playlists');
      if (isBinding) {
        this.listenTo(playlists, 'change:active', this._onPlaylistsChangeActive);
        this.listenTo(playlists, 'remove', this._onPlaylistsRemove);
      } else {
        this.stopListening(playlists);
      }
    },

    _setActivePlaylist: function(signedInUser) {
      var activePlaylist = null;

      if (!_.isNull(signedInUser)) {
        activePlaylist = signedInUser.get('playlists').getActivePlaylist() || null;
      }

      this.set('activePlaylist', activePlaylist);
    }
  });

  return ActivePlaylistManager;
});