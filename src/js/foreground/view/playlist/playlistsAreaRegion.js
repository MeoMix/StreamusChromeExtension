import {Region} from 'marionette';
import PlaylistsAreaView from 'foreground/view/playlist/playlistsAreaView';

var PlaylistsAreaRegion = Region.extend({
  signInManager: null,

  initialize: function(options) {
    this.signInManager = options.signInManager;

    this.listenTo(StreamusFG.channels.playlistsArea.commands, 'show:playlistsArea', this._showPlaylistsArea);
    this.listenTo(StreamusFG.channels.playlistsArea.commands, 'hide:playlistsArea', this._hidePlaylistsArea);
    this.listenTo(StreamusFG.channels.foregroundArea.vent, 'idle', this._onForegroundAreaIdle);
    this.listenTo(this.signInManager, 'change:signedInUser', this._onSignInManagerChangeSignedInUser);
  },

  // PlaylistsAreaView isn't initially visible. So, it is OK to defer creation until idle.
  // This ensures that initial rendering performance isn't hurt, but also allows for the view to be cached before needed.
  // Caching the view allows for a snappier response when animating.
  _onForegroundAreaIdle: function() {
    var signedInUser = this.signInManager.get('signedInUser');
    if (!_.isNull(signedInUser)) {
      this._createPlaylistsAreaView(signedInUser.get('playlists'));
    }
  },

  _showPlaylistsArea: function() {
    // It's possible that the user might want to show playlistsArea before the application's idle event.
    // If this happens, create the view immediately so that it can be shown.
    if (!this.hasView()) {
      var signedInUser = this.signInManager.get('signedInUser');
      this._createPlaylistsAreaView(signedInUser.get('playlists'));
    }

    this.currentView.show();
  },

  _hidePlaylistsArea: function() {
    // A hide command can be emitted by the application when the user is not signed in.
    if (this.hasView()) {
      this.currentView.hide();
    }
  },

  _createPlaylistsAreaView: function(playlists) {
    if (!this.hasView()) {
      var playlistsAreaView = new PlaylistsAreaView({
        playlists: playlists
      });

      this.show(playlistsAreaView);
    }
  },

  // Don't allow this view to be shown if the user is not signed in.
  _onSignInManagerChangeSignedInUser: function(model, signedInUser) {
    if (!_.isNull(signedInUser)) {
      this.empty();
      this._createPlaylistsAreaView(signedInUser.get('playlists'));
    } else if (this.hasView()) {
      this.currentView.hide();
    }
  }
});

export default PlaylistsAreaRegion;