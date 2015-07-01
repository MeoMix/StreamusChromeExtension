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

    _onSignInManagerChangeSignedInUser: function(model, signedInUser) {
      if (_.isNull(signedInUser)) {
        var previousSignedInUser = model.previous('signedInUser');

        if (!_.isNull(previousSignedInUser)) {
          this._setUserBindings(previousSignedInUser, false);
        }
      } else {
        this._setUserBindings(signedInUser, true);
      }

      this._setActivePlaylist(signedInUser);
    },

    _onPlaylistsChangeActive: function(model, active) {
      if (active) {
        this.set('activePlaylist', model);
      } else {
        if (this.get('activePlaylist') === model) {
          this.set('activePlaylist', null);
        }
      }
    },

    _setUserBindings: function(user, isBinding) {
      if (isBinding) {
        this.listenTo(user.get('playlists'), 'change:active', this._onPlaylistsChangeActive);
      } else {
        this.stopListening(user.get('playlists'));
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