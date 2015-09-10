import {LayoutView} from 'marionette';
import KeyCode from 'foreground/enum/keyCode';
import searchInputAreaTemplate from 'template/appBar/searchInputArea.hbs!';
import searchIconTemplate from 'template/icon/searchIcon_24.hbs!';
import closeIconTemplate from 'template/icon/closeIcon_24.hbs!';

var SearchInputAreaView = LayoutView.extend({
  className: 'searchInputArea flexRow',
  template: searchInputAreaTemplate,

  templateHelpers: function() {
    return {
      searchQuery: this.search.get('query'),
      searchIcon: searchIconTemplate,
      clearSearchIcon: closeIconTemplate
    };
  },

  ui: {
    searchButton: 'searchButton',
    searchInput: 'searchInput',
    searchInputWrapper: 'searchInputWrapper',
    clearSearchIcon: 'clearSearchIcon'
  },

  events: {
    'input @ui.searchInput': '_onInputSearchInput',
    'keypress @ui.searchInput': '_onKeyPressSearchInput',
    'focus @ui.searchInput': '_onFocusSearchInput',
    'blur @ui.searchInput': '_onBlurSearchInput',
    'click @ui.searchButton': '_onClickSearchButton',
    'click @ui.clearSearchIcon': '_onClickClearSearchIcon'
  },

  search: null,

  initialize: function(options) {
    this.search = options.search;
    this.listenTo(this.search, 'change:query', this._onSearchChangeQuery);
    this.listenTo(StreamusFG.channels.search.commands, 'focus:searchInput', this._focusSearchInput);
  },

  onRender: function() {
    var hasQuery = this.ui.searchInput.val().length > 0;
    this._setState(hasQuery);
  },

  onAttach: function() {
    this.ui.searchInput.select();
  },

  _onInputSearchInput: function() {
    var query = this.ui.searchInput.val();
    this._updateSearchQuery(query);
  },

  _onKeyPressSearchInput: function(event) {
    var query = this.ui.searchInput.val();

    // The search input is automatically focused on initial load. If the user presses space they
    // expect the player to toggle its playback state, but instead they input into the search field.
    // Override this behavior with what is expected.
    if (event.keyCode === KeyCode.Space && query.trim().length === 0) {
      event.preventDefault();
      StreamusFG.channels.playPauseButton.commands.trigger('tryToggle:playerState');
    }
  },

  _onClickSearchButton: function() {
    this._focusSearchInput();
  },

  _onClickClearSearchIcon: function() {
    var query = '';
    this.ui.searchInput.val(query);
    this._focusSearchInput();
    this._updateSearchQuery(query);
  },

  _onBlurSearchInput: function() {
    var searchInputValue = this.ui.searchInput.val();

    if (searchInputValue.trim().length === 0) {
      this.ui.searchInputWrapper.one('webkitTransitionEnd', this._onTransitionOutComplete.bind(this));
      this.ui.searchInputWrapper.removeClass('is-active').addClass('is-inactive');
      StreamusFG.channels.search.commands.trigger('hide:search');
    }
  },

  _onFocusSearchInput: function() {
    // Prevent inputWrapper from collapsing if input is focused mid-collapse.
    this.ui.searchInputWrapper.off('webkitTransitionEnd');
    this.ui.searchInputWrapper.addClass('is-active').removeClass('is-inactive');
  },

  _onSearchChangeQuery: function(model, query) {
    var searchInputElement = this.ui.searchInput[0];
    var selectionStart = searchInputElement.selectionStart;
    var selectionEnd = searchInputElement.selectionEnd;
    this.ui.searchInput.val(query);

    // Set the cursor's position to its previous location after modifying the query.
    // This allows users to keep typing with the cursor in the middle of the query.
    searchInputElement.setSelectionRange(selectionStart, selectionEnd);
  },

  _onTransitionOutComplete: function() {
    if (!this.isDestroyed) {
      this.ui.searchButton.removeClass('is-hidden');
      this.ui.searchInputWrapper.addClass('is-hidden');
    }
  },

  _updateSearchQuery: function(query) {
    // Ensure the search view is shown and then have it perform a search on the given query.
    StreamusFG.channels.search.commands.trigger('show:search');
    StreamusFG.channels.search.commands.trigger('search', {
      query: query
    });

    var hasQuery = query.length > 0;
    this._setState(hasQuery);
  },

  _focusSearchInput: function() {
    this.ui.searchButton.addClass('is-hidden');
    this.ui.searchInputWrapper.removeClass('is-hidden');
    // Need to use .select over .focus here due to a browser rendering issue.
    // http://stackoverflow.com/questions/31928330/input-element-transitions-improperly-when-focused-but-not-when-selected
    this.ui.searchInput.select();
  },

  _setState: function(hasQuery) {
    this.ui.clearSearchIcon.toggleClass('is-hidden', !hasQuery);
  }
});

export default SearchInputAreaView;