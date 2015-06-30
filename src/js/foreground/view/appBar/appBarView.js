define(function(require) {
  'use strict';

  var AdminMenuArea = require('foreground/model/appBar/adminMenuArea');
  var AdminMenuAreaView = require('foreground/view/appBar/adminMenuAreaView');
  var ActivePaneFilterView = require('foreground/view/appBar/activePaneFilterView');
  var ActivePaneFilter = require('foreground/model/appBar/activePaneFilter');
  var VolumeAreaView = require('foreground/view/appBar/volumeAreaView');
  var Tooltipable = require('foreground/view/behavior/tooltipable');
  var AppBarTemplate = require('text!template/appBar/appBar.html');
  var MenuIconTemplate = require('text!template/icon/menuIcon_24.svg');
  var SearchIconTemplate = require('text!template/icon/searchIcon_24.svg');
  var CloseIconTemplate = require('text!template/icon/closeIcon_24.svg');

  var AppBarView = Marionette.LayoutView.extend({
    id: 'appBar',
    template: _.template(AppBarTemplate),

    templateHelpers: function() {
      return {
        searchQuery: this.search.get('query'),
        showSearchMessage: chrome.i18n.getMessage('showSearch'),
        searchMessage: chrome.i18n.getMessage('search'),
        menuIcon: _.template(MenuIconTemplate)(),
        searchIcon: _.template(SearchIconTemplate)(),
        closeIcon: _.template(CloseIconTemplate)()
      };
    },

    regions: {
      volumeArea: '[data-region=volumeArea]',
      adminMenuArea: '[data-region=adminMenuArea]',
      activePaneFilter: '[data-region=activePaneFilter]'
    },

    ui: {
      searchInput: '[data-ui~=searchInput]',
      showPlaylistsAreaButton: '[data-ui~=showPlaylistsAreaButton]',
      hidePlaylistsAreaButton: '[data-ui~=hidePlaylistsAreaButton]'
    },

    events: {
      'input @ui.searchInput': '_onInputSearchInput',
      'blur @ui.searchInput': '_onBlurSearchInput',
      'click @ui.showPlaylistsAreaButton': '_onClickShowPlaylistsAreaButton',
      'click @ui.hidePlaylistsAreaButton': '_onClickHidePlaylistsAreaButton'
    },

    behaviors: {
      // Needed for the 'not signed in' message on nav button.
      Tooltipable: {
        behaviorClass: Tooltipable
      }
    },

    signInManager: null,
    search: null,

    initialize: function(options) {
      this.signInManager = options.signInManager;
      this.search = options.search;

      this.listenTo(this.signInManager, 'change:signedInUser', this._onSignInManagerChangeSignedInUser);
      this.listenTo(this.search, 'change:query', this._onSearchChangeQuery);

      this.listenTo(StreamusFG.channels.playlistsArea.vent, 'hiding', this._onPlaylistsAreaHiding);
      this.listenTo(StreamusFG.channels.playlistsArea.vent, 'showing', this._onPlaylistsAreaShowing);
      this.listenTo(StreamusFG.channels.search.vent, 'hiding', this._onSearchHiding);
      this.listenTo(StreamusFG.channels.search.vent, 'showing', this._onSearchShowing);
      this.listenTo(StreamusFG.channels.search.commands, 'focus:searchInput', this._focusSearchInput);
    },

    onRender: function() {
      var signedInUser = this.signInManager.get('signedInUser');
      this._setShowPlaylistsAreaButtonState(signedInUser);

      this.showChildView('activePaneFilter', new ActivePaneFilterView({
        model: new ActivePaneFilter({
          signInManager: StreamusFG.backgroundProperties.signInManager,
          activePlaylistManager: StreamusFG.backgroundProperties.activePlaylistManager
        })
      }));

      this.showChildView('volumeArea', new VolumeAreaView({
        player: StreamusFG.backgroundProperties.player
      }));

      this.showChildView('adminMenuArea', new AdminMenuAreaView({
        model: new AdminMenuArea(),
        tabManager: StreamusFG.backgroundProperties.tabManager
      }));
    },

    _onSearchChangeQuery: function(model, query) {
      var searchInputElement = this.ui.searchInput[0];
      var selectionStart = searchInputElement.selectionStart;
      var selectionEnd = searchInputElement.selectionEnd;
      this.ui.searchInput.val(query);

      // Preserve the selection range which is lost after modifying val
      searchInputElement.setSelectionRange(selectionStart, selectionEnd);
    },

    _onSignInManagerChangeSignedInUser: function(model, signedInUser) {
      this._setShowPlaylistsAreaButtonState(signedInUser);
    },

    _onInputSearchInput: function() {
      // TODO: This is weird. Fix.
      StreamusFG.channels.search.commands.trigger('show:search');
      StreamusFG.channels.search.commands.trigger('search', {
        query: this.ui.searchInput.val()
      });
    },

    _onBlurSearchInput: function() {
      var searchInputValue = this.ui.searchInput.val();

      if (searchInputValue.trim().length === 0) {
        StreamusFG.channels.search.commands.trigger('hide:search');
      }
    },

    _onClickShowPlaylistsAreaButton: function() {
      var isButtonEnabled = this._isShowPlaylistsAreaButtonEnabled();

      if (isButtonEnabled) {
        StreamusFG.channels.playlistsArea.commands.trigger('show:playlistsArea');
        StreamusFG.channels.search.commands.trigger('hide:search');
      }
    },

    _onClickHidePlaylistsAreaButton: function() {
      StreamusFG.channels.playlistsArea.commands.trigger('hide:playlistsArea');
    },

    _onPlaylistsAreaShowing: function() {
      this.ui.showPlaylistsAreaButton.addClass('is-hidden');
      this.ui.hidePlaylistsAreaButton.removeClass('is-hidden');
    },

    _onPlaylistsAreaHiding: function() {
      this.ui.showPlaylistsAreaButton.removeClass('is-hidden');
      this.ui.hidePlaylistsAreaButton.addClass('is-hidden');
    },

    _onSearchShowing: function() {
      //this.ui.showSearchButton.addClass('is-hidden');
      //this.ui.hideSearchButton.removeClass('is-hidden');

      this._focusSearchInput();
    },

    _onSearchHiding: function() {
      //this.ui.showSearchButton.removeClass('is-hidden');
      //this.ui.hideSearchButton.addClass('is-hidden');
    },

    _setShowPlaylistsAreaButtonState: function(signedInUser) {
      var signedOut = _.isNull(signedInUser);
      var tooltipText = signedOut ? chrome.i18n.getMessage('notSignedIn') : '';

      var isButtonEnabled = this._isShowPlaylistsAreaButtonEnabled();
      this.ui.showPlaylistsAreaButton.toggleClass('is-disabled', !isButtonEnabled).attr('data-tooltip-text', tooltipText);
    },

    // Can't show the navigation drawer if the user isn't logged in because playlists aren't loaded.
    _isShowPlaylistsAreaButtonEnabled: function() {
      return this.signInManager.has('signedInUser');
    },

    _focusSearchInput: function() {
      // Reset val after focusing to prevent selecting the text while maintaining focus.
      // This needs to be ran after makign the region visible because you can't focus an element which isn't visible.
      this.ui.searchInput.focus().val(this.ui.searchInput.val());
    }
  });

  return AppBarView;
});