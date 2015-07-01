define(function(require) {
  'use strict';

  var SearchInputAreaTemplate = require('text!template/appBar/searchInputArea.html');
  var SearchIconTemplate = require('text!template/icon/searchIcon_24.svg');
  var CloseIconTemplate = require('text!template/icon/closeIcon_24.svg');

  var SearchInputAreaView = Marionette.LayoutView.extend({
    className: 'searchInputArea flexRow',
    template: _.template(SearchInputAreaTemplate),

    templateHelpers: function() {
      return {
        searchQuery: this.search.get('query'),
        showSearchMessage: chrome.i18n.getMessage('showSearch'),
        searchIcon: _.template(SearchIconTemplate)(),
        searchMessage: chrome.i18n.getMessage('search'),
        clearSearchIcon: _.template(CloseIconTemplate)()
      };
    },

    ui: {
      searchButton: '[data-ui~=searchButton]',
      searchInput: '[data-ui~=searchInput]',
      searchInputWrapper: '[data-ui~=searchInputWrapper]',
      clearSearchIcon: '[data-ui~=clearSearchIcon]'
    },

    events: {
      'input @ui.searchInput': '_onInputSearchInput',
      'focus @ui.searchInput': '_onFocusSearchInput',
      'click @ui.searchButton': '_onClickSearchButton',
      'click @ui.clearSearchIcon': '_onClickClearSearchIcon'
    },

    search: null,

    initialize: function(options) {
      this.search = options.search;
      this.listenTo(this.search, 'change:query', this._onSearchChangeQuery);
      this.listenTo(StreamusFG.channels.search.commands, 'focus:searchInput', this._focusSearchInput);
      this.listenTo(StreamusFG.channels.element.vent, 'click', this._onElementClick);
    },

    // TODO: autofocus should also highlight existing text when re-opening.
    onRender: function() {
      var hasQuery = this.ui.searchInput.val().length > 0;
      this._setState(hasQuery);
    },

    onShow: function() {
      // TODO: This won't focus w/o autofocus attribute, but it really should...
      this._focusSearchInput();
    },

    _onInputSearchInput: function() {
      var query = this.ui.searchInput.val();
      this._updateSearchQuery(query);
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

    _onElementClick: function() {
      if (!this.ui.searchInput.is(':focus')) {
        var searchInputValue = this.ui.searchInput.val();

        if (searchInputValue.trim().length === 0) {
          this.ui.searchInputWrapper.one('webkitTransitionEnd', this._onTransitionOutComplete.bind(this));
          this.ui.searchInputWrapper.removeClass('is-active').addClass('is-inactive');
          StreamusFG.channels.search.commands.trigger('hide:search');
        }
      }
    },

    _onFocusSearchInput: function() {
      // TODO: This feels a bit weird, but it's needed to guarantee no weird flickering behavior if a focus comes in when collapsing.
      this.ui.searchInputWrapper.off('webkitTransitionEnd');
      this.ui.searchInputWrapper.addClass('is-active').removeClass('is-inactive');
    },

    _onSearchChangeQuery: function(model, query) {
      var searchInputElement = this.ui.searchInput[0];
      var selectionStart = searchInputElement.selectionStart;
      var selectionEnd = searchInputElement.selectionEnd;
      this.ui.searchInput.val(query);

      // Preserve the selection range which is lost after modifying val
      searchInputElement.setSelectionRange(selectionStart, selectionEnd);
    },

    _onTransitionOutComplete: function() {
      if (!this.isDestroyed) {
        this.ui.searchButton.removeClass('is-hidden');
        this.ui.searchInputWrapper.addClass('is-hidden');
      }
    },

    _updateSearchQuery: function(query) {
      // TODO: This is weird. Fix.
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
      // Reset val after focusing to prevent selecting the text while maintaining focus.
      // This needs to be ran after makign the region visible because you can't focus an element which isn't visible.
      this.ui.searchInput.focus().val(this.ui.searchInput.val());
    },

    _setState: function(hasQuery) {
      this.ui.clearSearchIcon.toggleClass('is-hidden', !hasQuery);
    }
  });

  return SearchInputAreaView;
});