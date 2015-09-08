import _ from 'common/shim/lodash.reference.shim';
import {LayoutView} from 'marionette';
import Tooltipable from 'foreground/view/behavior/tooltipable';
import PlaylistItemsView from 'foreground/view/leftPane/playlistItemsView';
import ActivePlaylistAreaTemplate from 'template/leftPane/activePlaylistArea.html!text';

var ActivePlaylistAreaView = LayoutView.extend({
  id: 'activePlaylistArea',
  className: 'flexColumn',
  template: _.template(ActivePlaylistAreaTemplate),

  templateHelpers: {
    addAllMessage: chrome.i18n.getMessage('addAll'),
    playAllMessage: chrome.i18n.getMessage('playAll'),
    playlistEmptyMessage: chrome.i18n.getMessage('playlistEmpty'),
    showSearchMessage: chrome.i18n.getMessage('showSearch'),
    searchForVideosMessage: chrome.i18n.getMessage('searchForVideos'),
    wouldYouLikeToMessage: chrome.i18n.getMessage('wouldYouLikeTo')
  },

  regions: {
    playlistItems: 'playlistItems'
  },

  ui: {
    playlistEmptyMessage: 'playlistEmptyMessage',
    showSearchLink: 'showSearchLink',
    playlistDetails: 'playlistDetails',
    playAllButton: 'playAllButton',
    addAllButton: 'addAllButton'
  },

  events: {
    'click @ui.showSearchLink': '_onClickShowSearchLink',
    'click @ui.addAllButton': '_onClickAddAllButton',
    'click @ui.playAllButton': '_onClickPlayAllButton'
  },

  behaviors: {
    Tooltipable: {
      behaviorClass: Tooltipable
    }
  },

  streamItems: null,

  streamItemsEvents: {
    'add:completed': '_onStreamItemsAddCompleted',
    'remove': '_onStreamItemsRemove',
    'reset': '_onStreamItemsReset'
  },

  playlistItemsEvents: {
    'add:completed': '_onPlaylistItemsAddCompleted',
    'remove': '_onPlaylistItemsRemove',
    'reset': '_onPlaylistItemsReset'
  },

  initialize: function(options) {
    this.streamItems = options.streamItems;
    this.bindEntityEvents(this.streamItems, this.streamItemsEvents);

    var playlistItems = this.model.get('items');
    this.bindEntityEvents(playlistItems, this.playlistItemsEvents);
  },

  onRender: function() {
    this._toggleButtons();
    this._updatePlaylistDetails(this.model.get('items').getDisplayInfo());
    this._toggleInstructions(this.model.get('items').isEmpty());

    this.showChildView('playlistItems', new PlaylistItemsView({
      collection: this.model.get('items')
    }));
  },

  _onClickShowSearchLink: function() {
    StreamusFG.channels.search.commands.trigger('show:search');
  },

  _onClickAddAllButton: function() {
    if (this._canAdd()) {
      var videos = this.model.get('items').pluck('video');

      this.streamItems.addVideos(videos);
    }
  },

  _onClickPlayAllButton: function() {
    if (this._canPlay()) {
      var videos = this.model.get('items').pluck('video');

      this.streamItems.addVideos(videos, {
        playOnAdd: true
      });
    }
  },

  _onStreamItemsAddCompleted: function() {
    this._toggleButtons();
  },

  _onStreamItemsRemove: function() {
    this._toggleButtons();
  },

  _onStreamItemsReset: function() {
    this._toggleButtons();
  },

  _onPlaylistItemsAddCompleted: function(collection) {
    this._toggleButtons();
    this._updatePlaylistDetails(collection.getDisplayInfo());
    this._toggleInstructions(false);
  },

  _onPlaylistItemsRemove: function(model, collection) {
    this._toggleButtons();
    this._updatePlaylistDetails(collection.getDisplayInfo());
    this._toggleInstructions(collection.isEmpty());
  },

  _onPlaylistItemsReset: function(collection) {
    this._toggleButtons();
    this._updatePlaylistDetails(collection.getDisplayInfo());
    this._toggleInstructions(collection.isEmpty());
  },

  _toggleInstructions: function(collectionEmpty) {
    this.ui.playlistEmptyMessage.toggleClass('is-hidden', !collectionEmpty);
  },

  _toggleButtons: function() {
    var isEmpty = this.model.get('items').isEmpty();
    this.ui.playAllButton.toggleClass('is-disabled', isEmpty);

    var duplicatesInfo = this.streamItems.getDuplicatesInfo(this.model.get('items').pluck('video'));
    var isDisabled = isEmpty || duplicatesInfo.allDuplicates;
    this.ui.addAllButton.toggleClass('is-disabled', isDisabled);

    var tooltipText = isEmpty ? '' : duplicatesInfo.message;
    this.ui.addAllButton.attr('data-tooltip-text', tooltipText);
  },

  _canPlay: function() {
    var isEmpty = this.model.get('items').isEmpty();
    return !isEmpty;
  },

  _canAdd: function() {
    var isEmpty = this.model.get('items').isEmpty();
    var videos = this.model.get('items').pluck('video');
    var duplicatesInfo = this.streamItems.getDuplicatesInfo(videos);

    return !isEmpty && !duplicatesInfo.allDuplicates;
  },

  _updatePlaylistDetails: function(displayInfo) {
    this.ui.playlistDetails.text(displayInfo).attr('data-tooltip-text', displayInfo);
  }
});

export default ActivePlaylistAreaView;