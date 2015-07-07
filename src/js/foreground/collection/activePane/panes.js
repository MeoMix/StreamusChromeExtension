define(function(require) {
  'use strict';

  var Pane = require('foreground/model/activePane/pane');
  var PaneType = require('foreground/enum/paneType');
  var LayoutType = require('common/enum/layoutType');

  var Panes = Backbone.Collection.extend({
    model: Pane,
    stream: null,
    settings: null,
    activePlaylistManager: null,

    initialize: function(models, options) {
      this.stream = options.stream;
      this.settings = options.settings;
      this.activePlaylistManager = options.activePlaylistManager;

      this.listenTo(this.settings, 'change:layoutType', this._onSettingsChangeLayoutType);
      this.listenTo(this.activePlaylistManager, 'change:activePlaylist', this._onActivePlaylistManagerChangeActivePlaylist);

      this._initializePanes(this.settings.get('layoutType'), this.activePlaylistManager.get('activePlaylist'));
    },

    // Determine whether the stream is visible or not based on the layoutType.
    // Playlist visibility is handled through the 'active' state on playlists rather than here.
    _onSettingsChangeLayoutType: function(settings, layoutType) {
      this._setStreamPaneVisibility(layoutType, this.activePlaylistManager.has('activePlaylist'));
    },

    _onActivePlaylistManagerChangeActivePlaylist: function(activePlaylistManager, activePlaylist) {
      var layoutType = this.settings.get('layoutType');
      var previousActivePlaylist = activePlaylistManager.previous('activePlaylist');
      this._initializePanes(layoutType, activePlaylist, previousActivePlaylist);
    },

    _initializePanes: function(layoutType, activePlaylist, previousActivePlaylist) {
      var activePlaylistExists = !_.isNull(activePlaylist);
      this._setStreamPaneVisibility(layoutType, activePlaylistExists);

      if (activePlaylistExists) {
        this._addPlaylistPane(activePlaylist);
      }

      if (!_.isNull(previousActivePlaylist) && !_.isUndefined(previousActivePlaylist)) {
        this._removePlaylistPane(previousActivePlaylist);
      }
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

    _addPlaylistPane: function(playlist) {
      this.add({
        type: PaneType.Playlist,
        relatedModel: playlist
      });
    },

    _removePlaylistPane: function(playlist) {
      var playlistPane = this._getPaneByRelatedModel(playlist);
      this.remove(playlistPane);
    },

    _getStreamPaneVisibility: function(layoutType, activePlaylistExists) {
      var isStreamPaneVisible = layoutType === LayoutType.SplitPane || !activePlaylistExists;
      return isStreamPaneVisible;
    },

    _addStreamPane: function() {
      this.add({
        type: PaneType.Stream,
        relatedModel: this.stream
      });
    },

    _removeStreamPane: function() {
      var streamPane = this._getStreamPane();
      this.remove(streamPane);
    },

    _setStreamPaneVisibility: function(layoutType, activePlaylistExists) {
      var isStreamPaneVisible = this._getStreamPaneVisibility(layoutType, activePlaylistExists);

      if (isStreamPaneVisible && !this._hasStreamPane()) {
        this._addStreamPane();
      } else if (!isStreamPaneVisible && this._hasStreamPane()) {
        this._removeStreamPane();
      }
    },

    _hasStreamPane: function() {
      var streamPane = this._getStreamPane();
      return !_.isUndefined(streamPane);
    }
  });

  return Panes;
});