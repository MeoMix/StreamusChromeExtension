define(function(require) {
  'use strict';

  var Tooltipable = require('foreground/view/behavior/tooltipable');
  var PlaylistItemsView = require('foreground/view/leftPane/playlistItemsView');
  var ActivePlaylistAreaTemplate = require('text!template/leftPane/activePlaylistArea.html');

  var ActivePlaylistAreaView = Marionette.LayoutView.extend({
    id: 'activePlaylistArea',
    className: 'flexColumn',
    template: _.template(ActivePlaylistAreaTemplate),

    templateHelpers: {
      addAllMessage: chrome.i18n.getMessage('addAll'),
      playAllMessage: chrome.i18n.getMessage('playAll'),
      playlistEmptyMessage: chrome.i18n.getMessage('playlistEmpty'),
      showSearchMessage: chrome.i18n.getMessage('showSearch'),
      searchForSongsMessage: chrome.i18n.getMessage('searchForSongs'),
      wouldYouLikeToMessage: chrome.i18n.getMessage('wouldYouLikeTo')
    },

    regions: {
      playlistItems: '[data-region=playlistItems]'
    },

    ui: {
      playlistEmptyMessage: '[data-ui~=playlistEmptyMessage]',
      showSearchLink: '[data-ui~=showSearchLink]',
      playlistDetails: '[data-ui~=playlistDetails]',
      playAllButton: '[data-ui~=playAllButton]',
      addAllButton: '[data-ui~=addAllButton]'
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
      Streamus.channels.search.commands.trigger('show:search');
    },

    _onClickAddAllButton: function() {
      if (this._canAdd()) {
        var songs = this.model.get('items').pluck('song');

        this.streamItems.addSongs(songs);
      }
    },

    _onClickPlayAllButton: function() {
      if (this._canPlay()) {
        var songs = this.model.get('items').pluck('song');

        this.streamItems.addSongs(songs, {
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

      var duplicatesInfo = this.streamItems.getDuplicatesInfo(this.model.get('items').pluck('song'));
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
      var songs = this.model.get('items').pluck('song');
      var duplicatesInfo = this.streamItems.getDuplicatesInfo(songs);

      return !isEmpty && !duplicatesInfo.allDuplicates;
    },

    _updatePlaylistDetails: function(displayInfo) {
      this.ui.playlistDetails.text(displayInfo).attr('data-tooltip-text', displayInfo);
    }
  });

  return ActivePlaylistAreaView;
});