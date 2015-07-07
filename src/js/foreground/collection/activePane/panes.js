define(function(require) {
  'use strict';

  var Pane = require('foreground/model/activePane/pane');
  var PaneType = require('foreground/enum/paneType');
  var LayoutType = require('common/enum/layoutType');

  var Panes = Backbone.Collection.extend({
    model: Pane,
    stream: null,
    signInManager: null,
    settings: null,
    activePlaylistManager: null,

    playlistsEvents: {
      'add': '_onPlaylistsAdd',
      'remove': '_onPlaylistsRemove',
      'reset': '_onPlaylistsReset',
      'change:active': '_onPlaylistsChangeActive'
    },

    initialize: function(models, options) {
      this.stream = options.stream;
      this.signInManager = options.signInManager;
      this.settings = options.settings;
      this.activePlaylistManager = options.activePlaylistManager;

      this.listenTo(this.signInManager, 'change:signedInUser', this._onSignInManagerChangeSignedInUser);
      this.listenTo(this.settings, 'change:layoutType', this._onSettingsChangeLayoutType);
      this.listenTo(this.activePlaylistManager, 'change:activePlaylist', this._onActivePlaylistManagerChangeActivePlaylist);

      this._initializePanes(this.signInManager.get('signedInUser'));
    },

    // When a user signs in - load their playlists and listen for changes. When a user signs out, cleanup the loaded playlists.
    _onSignInManagerChangeSignedInUser: function(signInManager, signedInUser) {
      if (_.isNull(signedInUser)) {
        this._destroyPlaylistPanes(signInManager.previous('signedInUser'));
      } else {
        this._initializePlaylistPanes(signedInUser);
      }
    },

    // Determine whether the stream is visible or not based on the layoutType.
    // Playlist visibility is handled through the 'active' state on playlists rather than here.
    _onSettingsChangeLayoutType: function(settings, layoutType) {
      this._setStreamPaneVisibility(layoutType, this.activePlaylistManager.has('activePlaylist'));
    },

    _onActivePlaylistManagerChangeActivePlaylist: function(activePlaylistManager, activePlaylist) {
      this._setStreamPaneVisibility(this.settings.get('layoutType'), !_.isNull(activePlaylist));

      // The active playlist can change before playlists have been added as panes when the
      // user is first signing in.
      if (this._hasPlaylistPanes()) {
        this._tryHideVisiblePlaylistPane();

        if (!_.isNull(activePlaylist)) {
          this._setPlaylistPaneVisibility(activePlaylist, true);
        }
      }
    },

    _onPlaylistsAdd: function(playlists, playlist) {
      this._addPlaylistPane(playlist);
    },

    _onPlaylistsRemove: function(playlists, playlist) {
      this._removePlaylistPane(playlist);
    },

    _onPlaylistsReset: function(playlists) {
      this._removeAllPlaylistPanes();
      this._addPlaylistPanes(playlists);
    },

    _onPlaylistsChangeActive: function(playlist, active) {
      this._setPlaylistPaneVisibility(playlist, active);
    },

    _initializePanes: function(signedInUser) {
      this._addStreamPane();

      if (!_.isNull(signedInUser)) {
        this._initializePlaylistPanes(signedInUser);
      }
    },

    _initializePlaylistPanes: function(signedInUser) {
      var playlists = signedInUser.get('playlists');
      this._setPlaylistsBindings(playlists, true);
      this._addPlaylistPanes(playlists);
    },

    _destroyPlaylistPanes: function(previousSignedInUser) {
      if (!_.isNull(previousSignedInUser)) {
        this._setPlaylistsBindings(previousSignedInUser.get('playlists'), false);
      }
      this._removeAllPlaylistPanes();
    },

    // Bind or unbind entity events to a user's playlists.
    _setPlaylistsBindings: function(playlists, isBinding) {
      var bindingAction = isBinding ? Marionette.bindEntityEvents : Marionette.unbindEntityEvents;
      bindingAction.call(this, this, playlists, this.playlistsEvents);
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

    _getPlaylistPanes: function() {
      var playlistPanes = this.where({
        type: PaneType.Playlist
      });

      return playlistPanes;
    },

    _addPlaylistPanes: function(playlists) {
      playlists.each(this._addPlaylistPane.bind(this));
    },

    _addPlaylistPane: function(playlist) {
      this.add({
        isVisible: playlist.get('active'),
        type: PaneType.Playlist,
        relatedModel: playlist
      });
    },

    _removePlaylistPane: function(playlist) {
      var playlistPane = this._getPaneByRelatedModel(playlist);
      this.remove(playlistPane);
    },

    _removeAllPlaylistPanes: function() {
      var playlistPanes = this._getPlaylistPanes();
      this.remove(playlistPanes);
    },

    _getStreamPaneVisibility: function(layoutType, activePlaylistExists) {
      var isStreamPaneVisible = layoutType === LayoutType.SplitPane || !activePlaylistExists;
      return isStreamPaneVisible;
    },

    _addStreamPane: function() {
      var layoutType = this.settings.get('layoutType');
      var activePlaylistExists = this.activePlaylistManager.has('activePlaylist');
      var isStreamPaneVisible = this._getStreamPaneVisibility(layoutType, activePlaylistExists);

      this.add({
        isVisible: isStreamPaneVisible,
        type: PaneType.Stream,
        relatedModel: this.stream
      });
    },

    _setStreamPaneVisibility: function(layoutType, activePlaylistExists) {
      var isStreamPaneVisible = this._getStreamPaneVisibility(layoutType, activePlaylistExists);
      var streamPane = this._getStreamPane();
      streamPane.set('isVisible', isStreamPaneVisible);
    },

    _setPlaylistPaneVisibility: function(playlist, isVisible) {
      var playlistPane = this._getPaneByRelatedModel(playlist);
      playlistPane.set('isVisible', isVisible);
    },

    // Try to hide the playlist pane which is visible if it exists.
    _tryHideVisiblePlaylistPane: function() {
      var visiblePlaylistPane = this._getVisiblePlaylistPane();

      if (!_.isUndefined(visiblePlaylistPane)) {
        visiblePlaylistPane.set('isVisible', false);
      }
    },

    // Return the playlist pane which is currently visible
    _getVisiblePlaylistPane: function() {
      var visiblePlaylistPane = this.findWhere({
        type: PaneType.Playlist,
        isVisible: true
      });

      return visiblePlaylistPane;
    },

    // Returns whether or not playlists have been added as panes.
    _hasPlaylistPanes: function() {
      var playlistPanes = this._getPlaylistPanes();
      return playlistPanes.length > 0;
    }
  });

  return Panes;
});