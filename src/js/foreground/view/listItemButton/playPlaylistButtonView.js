define(function(require) {
  'use strict';

  var ListItemButton = require('foreground/view/behavior/listItemButton');
  var PlayListItemButtonTemplate = require('text!template/listItemButton/playListItemButton.html');
  var PlayIconTemplate = require('text!template/icon/playIcon_18.svg');

  var PlayPlaylistButtonView = Marionette.ItemView.extend({
    template: _.template(PlayListItemButtonTemplate),
    templateHelpers: {
      playIcon: _.template(PlayIconTemplate)()
    },

    behaviors: {
      ListItemButton: {
        behaviorClass: ListItemButton
      }
    },

    streamItems: null,
    playlist: null,

    playlistItemsEvents: {
      'add:completed': '_onPlaylistItemsAddCompleted',
      'remove': '_onPlaylistItemsRemove',
      'reset': '_onPlaylistItemsReset'
    },

    initialize: function(options) {
      this.streamItems = options.streamItems;
      this.playlist = options.playlist;
      this.bindEntityEvents(this.playlist.get('items'), this.playlistItemsEvents);
    },

    onRender: function() {
      this._setState(this.playlist.get('items').isEmpty());
    },

    onClick: function() {
      var songs = this.playlist.get('items').pluck('song');

      this.streamItems.addSongs(songs, {
        playOnAdd: true
      });
    },

    _onPlaylistItemsAddCompleted: function(collection) {
      this._setState(collection.isEmpty());
    },

    _onPlaylistItemsRemove: function(model, collection) {
      this._setState(collection.isEmpty());
    },

    _onPlaylistItemsReset: function(collection) {
      this._setState(collection.isEmpty());
    },

    _setState: function(isEmpty) {
      this.$el.toggleClass('is-disabled', isEmpty);
      this.model.set('enabled', !isEmpty);

      var tooltipText = isEmpty ? chrome.i18n.getMessage('playlistEmpty') : chrome.i18n.getMessage('play');
      this.$el.attr('data-tooltip-text', tooltipText);
    }
  });

  return PlayPlaylistButtonView;
});