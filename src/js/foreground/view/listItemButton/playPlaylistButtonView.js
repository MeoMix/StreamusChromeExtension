import {LayoutView} from 'marionette';
import ListItemButton from 'foreground/view/behavior/listItemButton';
import playListItemButtonTemplate from 'template/listItemButton/playListItemButton.hbs!';
import playIconTemplate from 'template/icon/playIcon_18.hbs!';

var PlayPlaylistButtonView = LayoutView.extend({
  template: playListItemButtonTemplate,
  templateHelpers: {
    playIcon: playIconTemplate
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
    var videos = this.playlist.get('items').pluck('video');

    this.streamItems.addVideos(videos, {
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

export default PlayPlaylistButtonView;