import {LayoutView} from 'marionette';
import SpinnerView from 'foreground/view/element/spinnerView';
import SearchResultsView from 'foreground/view/search/searchResultsView';
import VideoActions from 'foreground/model/video/videoActions';
import Tooltipable from 'foreground/view/behavior/tooltipable';
import SearchTemplate from 'template/search/search.hbs!';

var SearchView = LayoutView.extend({
  id: 'search',
  className: 'leftPane flexColumn panel-content panel-content--uncolored u-fullHeight',
  template: SearchTemplate,

  regions: {
    searchResults: 'searchResults',
    spinner: 'spinner'
  },

  ui: {
    playAllButton: 'playAllButton',
    saveAllButton: 'saveAllButton',
    addAllButton: 'addAllButton',
    searchingMessage: 'searchingMessage',
    typeToSearchMessage: 'typeToSearchMessage',
    noResultsMessage: 'noResultsMessage'
  },

  behaviors: {
    Tooltipable: {
      behaviorClass: Tooltipable
    }
  },

  events: {
    'click @ui.playAllButton': '_onClickPlayAllButton',
    'click @ui.addAllButton': '_onClickAddAllButton',
    'click @ui.saveAllButton': '_onClickSaveAllButton'
  },

  modelEvents: {
    'change:query': '_onChangeQuery',
    'change:searching': '_onChangeSearching'
  },

  collectionEvents: {
    'add:completed': '_onSearchResultsAddCompleted',
    'remove': '_onSearchResultsRemove',
    'reset': '_onSearchResultsReset'
  },

  streamItems: null,
  streamItemsEvents: {
    'add:completed': '_onStreamItemsAddCompleted',
    'remove': '_onStreamItemsRemove',
    'reset': '_onStreamItemsReset'
  },

  transitionDuration: 4000,
  signInManager: null,

  initialize: function(options) {
    this.streamItems = options.streamItems;
    this.signInManager = options.signInManager;

    this.bindEntityEvents(this.streamItems, this.streamItemsEvents);
    this.listenTo(this.signInManager, 'change:signedInUser', this._onSignInManagerChangeSignedInUser);
    this.listenTo(StreamusFG.channels.search.commands, 'search', this._search);
  },

  onRender: function() {
    this._setButtonStates();
    this._toggleInstructions();

    this.showChildView('searchResults', new SearchResultsView({
      collection: this.model.get('results')
    }));
  },

  // onVisible is triggered when the element begins to transition into the viewport.
  onVisible: function() {
    this.model.stopClearQueryTimer();
  },

  _onClickSaveAllButton: function() {
    var canSave = this._canSave();

    if (canSave) {
      this._showSaveSelectedSimpleMenu();
    }
  },

  _onClickAddAllButton: function() {
    var canAdd = this._canAdd();

    if (canAdd) {
      var videos = this.collection.pluck('video');
      this.streamItems.addVideos(videos);
    }
  },

  _onClickPlayAllButton: function() {
    var canPlay = this._canPlay();

    if (canPlay) {
      var videos = this.collection.pluck('video');
      this.streamItems.addVideos(videos, {
        playOnAdd: true
      });
    }
  },

  _onSignInManagerChangeSignedInUser: function() {
    this._setSaveAllButtonState();
  },

  _onChangeSearching: function() {
    this._toggleInstructions();
  },

  _onChangeQuery: function() {
    this._toggleInstructions();
  },

  _onStreamItemsAddCompleted: function() {
    this._setButtonStates();
  },

  _onStreamItemsRemove: function() {
    this._setButtonStates();
  },

  _onStreamItemsReset: function() {
    this._setButtonStates();
  },

  _onSearchResultsReset: function() {
    this._toggleInstructions();
    this._setButtonStates();
  },

  _onSearchResultsAddCompleted: function() {
    this._toggleInstructions();
    this._setButtonStates();
  },

  _onSearchResultsRemove: function() {
    this._toggleInstructions();
    this._setButtonStates();
  },

  // Searches youtube for video results based on the given text.
  _search: function(options) {
    this.model.set('query', options.query);
  },

  _setSaveAllButtonState: function() {
    var canSave = this._canSave();
    this.ui.saveAllButton.toggleClass('is-disabled', !canSave);
  },

  _setButtonStates: function() {
    this._setSaveAllButtonState();

    var canPlay = this._canPlay();
    this.ui.playAllButton.toggleClass('is-disabled', !canPlay);

    var canAdd = this._canAdd();
    this.ui.addAllButton.toggleClass('is-disabled', !canAdd);

    var duplicatesInfo = this.streamItems.getDuplicatesInfo(this.collection.pluck('video'));
    this.ui.addAllButton.attr('data-tooltip-text', duplicatesInfo.message);
  },

  _showSaveSelectedSimpleMenu: function() {
    var canSave = this._canSave();

    if (canSave) {
      var videoActions = new VideoActions();
      var videos = this.collection.pluck('video');
      var offset = this.ui.saveAllButton.offset();
      var playlists = this.signInManager.get('signedInUser').get('playlists');

      videoActions.showSaveMenu(videos, offset.top, offset.left, playlists);
    }
  },

  _canSave: function() {
    var signedIn = this.signInManager.has('signedInUser');
    var isEmpty = this.collection.isEmpty();

    return signedIn && !isEmpty;
  },

  _canPlay: function() {
    var isEmpty = this.collection.isEmpty();

    return !isEmpty;
  },

  _canAdd: function() {
    var isEmpty = this.collection.isEmpty();
    var videos = this.collection.pluck('video');
    var duplicatesInfo = this.streamItems.getDuplicatesInfo(videos);

    return !isEmpty && !duplicatesInfo.allDuplicates;
  },

  // Set the visibility of any visible text messages.
  _toggleInstructions: function() {
    var hasSearchResults = this.collection.length > 0;

    // Hide the search message when there is no search in progress
    // If the search is in progress and the first 50 results have already been returned, also hide the message.
    var searching = this.model.get('searching');

    // Prefer lazy-loading the SpinnerView to not take a perf hit if the view isn't loading.
    if (searching && !this.getRegion('spinner').hasView()) {
      this.showChildView('spinner', new SpinnerView());
    }

    this.ui.searchingMessage.toggleClass('is-hidden', !searching || hasSearchResults);

    // Hide the type to search message once user has typed something.
    var hasSearchQuery = this.model.hasQuery();
    this.ui.typeToSearchMessage.toggleClass('is-hidden', hasSearchQuery);

    // Only show no results when all other options are exhausted and user has interacted.
    var hideNoResults = hasSearchResults || searching || !hasSearchQuery;
    this.ui.noResultsMessage.toggleClass('is-hidden', hideNoResults);
  }
});

export default SearchView;