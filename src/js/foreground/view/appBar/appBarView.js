define(function(require) {
  'use strict';

  var AdminMenuArea = require('foreground/model/appBar/adminMenuArea');
  var AdminMenuAreaView = require('foreground/view/appBar/adminMenuAreaView');
  var NextButtonView = require('foreground/view/appBar/nextButtonView');
  var PlaylistTitleView = require('foreground/view/appBar/playlistTitleView');
  var PlayPauseButtonView = require('foreground/view/appBar/playPauseButtonView');
  var PreviousButtonView = require('foreground/view/appBar/previousButtonView');
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
      playlistTitle: '[data-region=playlistTitle]',
      volumeArea: '[data-region=volumeArea]',
      adminMenuArea: '[data-region=adminMenuArea]',
      previousButton: '[data-region=previousButton]',
      playPauseButton: '[data-region=playPauseButton]',
      nextButton: '[data-region=nextButton]'
    },

    ui: {
      searchInput: '[data-ui~=searchInput]',
      showSearchButton: '[data-ui~=showSearchButton]',
      hideSearchButton: '[data-ui~=hideSearchButton]',
      showPlaylistsAreaButton: '[data-ui~=showPlaylistsAreaButton]',
      hidePlaylistsAreaButton: '[data-ui~=hidePlaylistsAreaButton]',
      // I don't like regions being manipulated in UI they should be stateless.
      // However, this area is going to change pretty soon once the new UI gets added. So, no need to fix right now.
      playlistTitleRegion: '[data-ui~=playlistTitleRegion]',
      searchInputRegion: '[data-ui~=searchInputRegion]'
    },

    events: {
      'click @ui.showSearchButton': '_onClickShowSearchButton',
      'click @ui.hideSearchButton': '_onClickHideSearchButton',
      'input @ui.searchInput': '_onInputSearchInput',
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

      var signedInUser = this.signInManager.get('signedInUser');
      if (!_.isNull(signedInUser)) {
        this.listenTo(signedInUser.get('playlists'), 'change:active', this._onPlaylistsChangeActive);
      }
    },

    onRender: function() {
      var signedInUser = this.signInManager.get('signedInUser');
      this._setShowPlaylistsAreaButtonState(signedInUser);

      if (!_.isNull(signedInUser)) {
        this._setPlaylistTitleRegion(signedInUser);
      }

      this.showChildView('volumeArea', new VolumeAreaView({
        player: StreamusFG.backgroundProperties.player
      }));

      this.showChildView('adminMenuArea', new AdminMenuAreaView({
        model: new AdminMenuArea(),
        tabManager: StreamusFG.backgroundProperties.tabManager
      }));

      this.showChildView('previousButton', new PreviousButtonView({
        model: StreamusFG.backgroundProperties.previousButton
      }));

      this.showChildView('playPauseButton', new PlayPauseButtonView({
        model: StreamusFG.backgroundProperties.playPauseButton,
        player: StreamusFG.backgroundProperties.player
      }));

      this.showChildView('nextButton', new NextButtonView({
        model: StreamusFG.backgroundProperties.nextButton
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
      if (_.isNull(signedInUser)) {
        this.stopListening(model.previous('signedInUser').get('playlists'));
        this.getRegion('playlistTitle').empty();
      } else {
        this._setPlaylistTitleRegion(signedInUser);
        this.listenTo(signedInUser.get('playlists'), 'change:active', this._onPlaylistsChangeActive);
      }

      this._setShowPlaylistsAreaButtonState(signedInUser);
    },

    _onPlaylistsChangeActive: function(model, active) {
      if (active) {
        this.showChildView('playlistTitle', new PlaylistTitleView({
          model: model
        }));
      }
    },

    _onClickShowSearchButton: function() {
      StreamusFG.channels.search.commands.trigger('show:search');
      StreamusFG.channels.playlistsArea.commands.trigger('hide:playlistsArea');
    },

    _onClickHideSearchButton: function() {
      StreamusFG.channels.search.commands.trigger('hide:search');
    },

    _onInputSearchInput: function() {
      StreamusFG.channels.search.commands.trigger('search', {
        query: this.ui.searchInput.val()
      });
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
      this.ui.showSearchButton.addClass('is-hidden');
      this.ui.hideSearchButton.removeClass('is-hidden');
      this.ui.playlistTitleRegion.addClass('is-hidden');
      this.ui.searchInputRegion.removeClass('is-hidden');

      this._focusSearchInput();
    },

    _onSearchHiding: function() {
      this.ui.showSearchButton.removeClass('is-hidden');
      this.ui.hideSearchButton.addClass('is-hidden');
      this.ui.playlistTitleRegion.removeClass('is-hidden');
      this.ui.searchInputRegion.addClass('is-hidden');
    },

    _setPlaylistTitleRegion: function(signedInUser) {
      this.showChildView('playlistTitle', new PlaylistTitleView({
        model: signedInUser.get('playlists').getActivePlaylist()
      }));
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