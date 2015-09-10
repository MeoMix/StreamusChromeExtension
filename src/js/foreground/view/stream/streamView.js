import {LayoutView} from 'marionette';
import ClearStreamButton from 'foreground/model/stream/clearStreamButton';
import SaveStreamButton from 'foreground/model/stream/saveStreamButton';
import ClearStreamButtonView from 'foreground/view/stream/clearStreamButtonView';
import SaveStreamButtonView from 'foreground/view/stream/saveStreamButtonView';
import StreamItemsView from 'foreground/view/stream/streamItemsView';
import streamTemplate from 'template/stream/stream.hbs!';

var StreamView = LayoutView.extend({
  id: 'stream',
  className: 'flexColumn',
  template: streamTemplate,

  templateHelpers: {
    emptyMessage: chrome.i18n.getMessage('streamEmpty'),
    searchForVideosMessage: chrome.i18n.getMessage('searchForVideos'),
    whyNotAddAVideoFromAPlaylistOrMessage: chrome.i18n.getMessage('whyNotAddAVideoFromAPlaylistOr')
  },

  regions: {
    clearStreamButton: 'clearStreamButton',
    saveStreamButton: 'saveStreamButton',
    streamItems: 'streamItems'
  },

  ui: {
    emptyMessage: 'emptyMessage',
    focusSearchInputLink: 'focusSearchInputLink',
    streamDetails: 'streamDetails'
  },

  events: {
    'click @ui.focusSearchInputLink': '_onClickFocusSearchInputLink'
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
    this._updateStreamDetails(this.model.get('items').getDisplayInfo());

    this.showChildView('streamItems', new StreamItemsView({
      collection: this.model.get('items')
    }));

    this.showChildView('clearStreamButton', new ClearStreamButtonView({
      model: new ClearStreamButton({
        streamItems: this.model.get('items')
      })
    }));

    this.showChildView('saveStreamButton', new SaveStreamButtonView({
      model: new SaveStreamButton({
        streamItems: this.model.get('items'),
        signInManager: StreamusFG.backgroundProperties.signInManager
      })
    }));
  },

  _onClickFocusSearchInputLink: function() {
    StreamusFG.channels.search.commands.trigger('focus:searchInput');
  },

  _onStreamItemsAddCompleted: function(collection) {
    this._setState(collection.isEmpty());
    this._updateStreamDetails(collection.getDisplayInfo());
  },

  _onStreamItemsRemove: function(model, collection) {
    this._setState(collection.isEmpty());
    this._updateStreamDetails(collection.getDisplayInfo());
  },

  _onStreamItemsReset: function(collection) {
    this._setState(collection.isEmpty());
    this._updateStreamDetails(collection.getDisplayInfo());
  },

  // Hide the empty message if there is anything in the collection
  _setState: function(collectionEmpty) {
    this.ui.emptyMessage.toggleClass('is-hidden', !collectionEmpty);
  },

  _updateStreamDetails: function(displayInfo) {
    this.ui.streamDetails.text(displayInfo).attr('data-tooltip-text', displayInfo);
  }
});

export default StreamView;