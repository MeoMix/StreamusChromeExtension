define(function(require) {
  'use strict';

  var Pane = require('foreground/model/activePane/pane');
  var PaneType = require('foreground/enum/paneType');
  var LayoutType = require('common/enum/layoutType');

  var Panes = Backbone.Collection.extend({
    model: Pane,
    comparator: function(firstPane, secondPane) {
      // Active playlist should always appear on the left-hand side.
      var result = 0;
      var firstPaneType = firstPane.get('type');
      var secondPaneType = secondPane.get('type');

      if (firstPaneType === LayoutType.Playlist && secondPaneType === LayoutType.Stream) {
        result = -1;
      } else if (firstPaneType === LayoutType.Stream && secondPaneType === LayoutType.Playlist) {
        result = 1;
      }

      return result;
    },

    // TODO: Save to local storage
    stream: null,
    signInManager: null,
    settings: null,
    activePlaylistManager: null,

    initialize: function(models, options) {
      this.stream = options.stream;
      this.signInManager = options.signInManager;
      this.settings = options.settings;
      this.activePlaylistManager = options.activePlaylistManager;

      this._addStream();

      var signedInUser = this.signInManager.get('signedInUser');

      if (!_.isNull(signedInUser)) {
        this._setUserBindings(signedInUser, true);
        this._addPlaylists(signedInUser.get('playlists'));
      }

      this.listenTo(this.signInManager, 'change:signedInUser', this._onSignInManagerChangeSignedInUser);
      this.listenTo(this.settings, 'change:layoutType', this._onSettingsChangeLayoutType);
      this.listenTo(this.activePlaylistManager, 'change:activePlaylist', this._onActivePlaylistManagerChangeActivePlaylist);
    },

    _onSignInManagerChangeSignedInUser: function(signInManager, signedInUser) {
      if (_.isNull(signedInUser)) {
        var previousSignedInUser = model.previous('signedInUser');

        if (!_.isNull(previousSignedInUser)) {
          this._setUserBindings(previousSignedInUser, false);
        }

        this._removeAllPlaylists();
      } else {
        this._setUserBindings(signedInUser, true);
      }

      this._addPlaylists(signedInUser.get('playlists'));
    },

    _onSettingsChangeLayoutType: function(settings, layoutType) {
      var isStreamPaneVisible = this._getIsStreamPaneVisible(layoutType);
      var streamPane = this._getStreamPane();
      streamPane.set('isVisible', isStreamPaneVisible);
    },

    _onActivePlaylistManagerChangeActivePlaylist: function(activePlaylistManager, activePlaylist) {
      var isStreamPaneVisible = this._getIsStreamPaneVisible(this.settings.get('layoutType'));
      var streamPane = this._getStreamPane();
      streamPane.set('isVisible', isStreamPaneVisible);

      var visiblePlaylistPane = this.findWhere({
        type: PaneType.Playlist,
        isVisible: true
      });

      if (!_.isUndefined(visiblePlaylistPane) && visiblePlaylistPane.get('relatedModel') !== activePlaylist) {
        visiblePlaylistPane.set('isVisible', false);
      }

      if (!_.isNull(activePlaylist)) {
        var activePlaylistPane = this.findWhere({
          type: PaneType.Playlist,
          relatedModel: activePlaylist
        });

        // If the user signed in event hasn't triggered yet then this will be undefined.
        if (!_.isUndefined(activePlaylistPane)) {
          activePlaylistPane.set('isVisible', true);
        }
      }
    },

    _setUserBindings: function(user, isBinding) {
      if (isBinding) {
        this.listenTo(user.get('playlists'), 'add', this._onPlaylistsAdd);
        this.listenTo(user.get('playlists'), 'remove', this._onPlaylistsRemove);
        this.listenTo(user.get('playlists'), 'reset', this._onPlaylistsReset);
        this.listenTo(user.get('playlists'), 'change:active', this._onPlaylistsChangeActive);
      } else {
        this.stopListening(user.get('playlists'));
      }
    },

    _onPlaylistsAdd: function(playlists, playlist) {
      this._addPlaylist(playlist);
    },

    _onPlaylistsRemove: function(playlists, playlist) {
      var pane = this._getPaneByRelatedModel(playlist);
      this.remove(pane);
    },

    _onPlaylistsReset: function(playlists) {
      this._removeAllPlaylists();
      this._addPlaylists(playlists);
    },

    _onPlaylistsChangeActive: function(playlist, active) {
      var pane = this._getPaneByRelatedModel(playlist);
      pane.set('isVisible', active);
    },

    _getPaneByRelatedModel: function(relatedModel) {
      var pane = this.findWhere({
        relatedModel: relatedModel
      });

      return pane;
    },

    _getStreamPane: function() {
      var streamPane = this.findWhere({
        type: PaneType.Stream
      });

      return streamPane;
    },

    _getPanesByType: function(type) {
      var panes = this.where({
        type: type
      });

      return panes;
    },

    _addPlaylists: function(playlists) {
      playlists.each(this._addPlaylist.bind(this));
    },

    _addPlaylist: function(playlist) {
      this.add({
        isVisible: playlist.get('active'),
        type: PaneType.Playlist,
        relatedModel: playlist
      });
    },

    _removeAllPlaylists: function() {
      var existingPlaylistPanes = this._getPanesByType(PaneType.Playlist);
      this.remove(existingPlaylistPanes);
    },

    _getIsStreamPaneVisible: function(layoutType) {
      var isStreamPaneVisible = layoutType === LayoutType.SplitPane || !this.activePlaylistManager.has('activePlaylist');
      return isStreamPaneVisible;
    },

    _addStream: function() {
      var layoutType = this.settings.get('layoutType');
      var isStreamPaneVisible = this._getIsStreamPaneVisible(layoutType);

      this.add({
        isVisible: isStreamPaneVisible,
        type: PaneType.Stream,
        relatedModel: this.stream
      });
    }
  });

  return Panes;
});