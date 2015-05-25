define(function(require) {
  'use strict';

  var ClearStreamButton = require('foreground/model/stream/clearStreamButton');
  var SaveStreamButton = require('foreground/model/stream/saveStreamButton');
  var ActiveStreamItemView = require('foreground/view/stream/activeStreamItemView');
  var ClearStreamButtonView = require('foreground/view/stream/clearStreamButtonView');
  var RadioButtonView = require('foreground/view/stream/radioButtonView');
  var RepeatButtonView = require('foreground/view/stream/repeatButtonView');
  var SaveStreamButtonView = require('foreground/view/stream/saveStreamButtonView');
  var ShuffleButtonView = require('foreground/view/stream/shuffleButtonView');
  var StreamItemsView = require('foreground/view/stream/streamItemsView');
  var StreamTemplate = require('text!template/stream/stream.html');

  var StreamView = Marionette.LayoutView.extend({
    id: 'stream',
    className: 'flexColumn',
    template: _.template(StreamTemplate),

    templateHelpers: {
      emptyMessage: chrome.i18n.getMessage('streamEmpty'),
      searchForSongsMessage: chrome.i18n.getMessage('searchForSongs'),
      whyNotAddASongFromAPlaylistOrMessage: chrome.i18n.getMessage('whyNotAddASongFromAPlaylistOr')
    },

    regions: {
      clearStreamButton: '[data-region=clearStreamButton]',
      radioButton: '[data-region=radioButton]',
      repeatButton: '[data-region=repeatButton]',
      saveStreamButton: '[data-region=saveStreamButton]',
      shuffleButton: '[data-region=shuffleButton]',
      activeStreamItem: '[data-region=activeStreamItem]',
      streamItems: '[data-region=streamItems]'
    },

    ui: {
      emptyMessage: '[data-ui~=emptyMessage]',
      showSearchLink: '[data-ui~=showSearchLink]'
    },

    events: {
      'click @ui.showSearchLink': '_onClickShowSearchLink'
    },

    modelEvents: {
      'change:activeItem': '_onChangeActiveItem'
    },

    streamItemsEvents: {
      'add:completed': '_onStreamItemsAddCompleted',
      'remove': '_onStreamItemsRemove',
      'reset': '_onStreamItemsReset'
    },

    initialize: function() {
      this.bindEntityEvents(this.model.get('items'), this.streamItemsEvents);
    },

    onRender: function() {
      this._setState(this.model.get('items').isEmpty());

      this.showChildView('streamItems', new StreamItemsView({
        collection: this.model.get('items')
      }));

      this.showChildView('shuffleButton', new ShuffleButtonView({
        model: Streamus.backgroundPage.shuffleButton
      }));

      this.showChildView('repeatButton', new RepeatButtonView({
        model: Streamus.backgroundPage.repeatButton
      }));

      this.showChildView('radioButton', new RadioButtonView({
        model: Streamus.backgroundPage.radioButton
      }));

      this.showChildView('clearStreamButton', new ClearStreamButtonView({
        model: new ClearStreamButton({
          streamItems: this.model.get('items')
        })
      }));

      this.showChildView('saveStreamButton', new SaveStreamButtonView({
        model: new SaveStreamButton({
          streamItems: this.model.get('items'),
          signInManager: Streamus.backgroundPage.signInManager
        })
      }));

      var activeItem = this.model.get('activeItem');
      if (!_.isNull(activeItem)) {
        this._showActiveStreamItem(activeItem, true);
      }
    },

    _onClickShowSearchLink: function() {
      this._showSearch();
    },

    _onChangeActiveItem: function(model, activeItem) {
      if (_.isNull(activeItem)) {
        this.getChildView('activeStreamItem').hide();
      } else {
        // If an active item was already shown then no transition is needed because the view is visible.
        var isInstant = !_.isNull(model.previous('activeItem'));
        this._showActiveStreamItem(activeItem, isInstant);
      }
    },

    _onStreamItemsAddCompleted: function(collection) {
      this._setState(collection.isEmpty());
    },

    _onStreamItemsRemove: function(model, collection) {
      this._setState(collection.isEmpty());
    },

    _onStreamItemsReset: function(collection) {
      this._setState(collection.isEmpty());
    },

    // Hide the empty message if there is anything in the collection
    _setState: function(collectionEmpty) {
      this.ui.emptyMessage.toggleClass('is-hidden', !collectionEmpty);
    },

    _showSearch: function() {
      Streamus.channels.search.commands.trigger('show:search');
    },

    _showActiveStreamItem: function(activeStreamItem, instant) {
      this.showChildView('activeStreamItem', new ActiveStreamItemView({
        model: activeStreamItem,
        player: Streamus.backgroundPage.player,
        instant: instant
      }));
    }
  });

  return StreamView;
});