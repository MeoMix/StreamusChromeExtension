'use strict';
import {Collection} from 'backbone';
import ActivePane from 'foreground/model/activePane/activePane';
import ActivePaneType from 'foreground/enum/activePaneType';
import LayoutType from 'common/enum/layoutType';

var ActivePanes = Collection.extend({
  model: ActivePane,
  stream: null,
  settings: null,
  activePlaylistManager: null,

  initialize: function(models, options) {
    this.stream = options.stream;
    this.settings = options.settings;
    this.activePlaylistManager = options.activePlaylistManager;

    this.listenTo(this.settings, 'change:layoutType', this._onSettingsChangeLayoutType);
    this.listenTo(this.activePlaylistManager, 'change:activePlaylist', this._onActivePlaylistManagerChangeActivePlaylist);

    var layoutType = this.settings.get('layoutType');
    var activePlaylist = this.activePlaylistManager.get('activePlaylist');
    this._initializePanes(layoutType, activePlaylist);
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

    if (previousActivePlaylist) {
      this._removePlaylistPane(previousActivePlaylist);
    }
  },

  _addPlaylistPane: function(playlist) {
    this.add({
      type: ActivePaneType.Playlist,
      relatedModel: playlist
    });
  },

  _removePlaylistPane: function(playlist) {
    var playlistPane = this.findWhere({
      relatedModel: playlist
    });
    this.remove(playlistPane);
  },

  _addStreamPane: function() {
    this.add({
      type: ActivePaneType.Stream,
      relatedModel: this.stream
    });
  },

  _removeStreamPane: function() {
    var streamPane = this._getStreamPane();
    this.remove(streamPane);
  },

  _getStreamPaneVisibility: function(layoutType, activePlaylistExists) {
    var isStreamPaneVisible = layoutType === LayoutType.SplitPane || !activePlaylistExists;
    return isStreamPaneVisible;
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
  },

  _getStreamPane: function() {
    var streamPane = this.findWhere({
      type: ActivePaneType.Stream
    });

    return streamPane;
  }
});

export default ActivePanes;