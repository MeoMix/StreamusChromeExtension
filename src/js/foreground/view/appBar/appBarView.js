define(function(require) {
  'use strict';

  var AdminMenuArea = require('foreground/model/appBar/adminMenuArea');
  var AdminMenuAreaView = require('foreground/view/appBar/adminMenuAreaView');
  var ActivePaneFilterView = require('foreground/view/appBar/activePaneFilterView');
  var ActivePaneFilter = require('foreground/model/appBar/activePaneFilter');
  var VolumeAreaView = require('foreground/view/appBar/volumeAreaView');
  var SearchInputAreaView = require('foreground/view/appBar/searchInputAreaView');
  var Tooltipable = require('foreground/view/behavior/tooltipable');
  var AppBarTemplate = require('text!template/appBar/appBar.html');
  var MenuIconTemplate = require('text!template/icon/menuIcon_24.svg');
  var CloseIconTemplate = require('text!template/icon/closeIcon_24.svg');

  var AppBarView = Marionette.LayoutView.extend({
    id: 'appBar',
    template: _.template(AppBarTemplate),

    templateHelpers: function() {
      return {
        menuIcon: _.template(MenuIconTemplate)(),
        closeIcon: _.template(CloseIconTemplate)()
      };
    },

    regions: {
      volumeArea: 'volumeArea',
      adminMenuArea: 'adminMenuArea',
      activePaneFilter: 'activePaneFilter',
      searchInputArea: 'searchInputArea'
    },

    ui: {
      showPlaylistsAreaButton: 'showPlaylistsAreaButton',
      hidePlaylistsAreaButton: 'hidePlaylistsAreaButton'
    },

    events: {
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

    initialize: function(options) {
      this.signInManager = options.signInManager;

      this.listenTo(this.signInManager, 'change:signedInUser', this._onSignInManagerChangeSignedInUser);

      this.listenTo(StreamusFG.channels.playlistsArea.vent, 'hiding', this._onPlaylistsAreaHiding);
      this.listenTo(StreamusFG.channels.playlistsArea.vent, 'showing', this._onPlaylistsAreaShowing);
    },

    onRender: function() {
      var signedInUser = this.signInManager.get('signedInUser');
      this._setShowPlaylistsAreaButtonState(signedInUser);

      this.showChildView('activePaneFilter', new ActivePaneFilterView({
        settings: StreamusFG.backgroundProperties.settings,
        model: new ActivePaneFilter({
          signInManager: StreamusFG.backgroundProperties.signInManager,
          activePlaylistManager: StreamusFG.backgroundProperties.activePlaylistManager
        })
      }));

      this.showChildView('searchInputArea', new SearchInputAreaView({
        search: StreamusFG.backgroundProperties.search
      }));

      this.showChildView('volumeArea', new VolumeAreaView({
        player: StreamusFG.backgroundProperties.player
      }));

      this.showChildView('adminMenuArea', new AdminMenuAreaView({
        model: new AdminMenuArea(),
        tabManager: StreamusFG.backgroundProperties.tabManager
      }));
    },

    _onSignInManagerChangeSignedInUser: function(model, signedInUser) {
      this._setShowPlaylistsAreaButtonState(signedInUser);
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

    _setShowPlaylistsAreaButtonState: function(signedInUser) {
      var signedOut = _.isNull(signedInUser);
      var tooltipText = signedOut ? chrome.i18n.getMessage('notSignedIn') : '';

      var isButtonEnabled = this._isShowPlaylistsAreaButtonEnabled();
      this.ui.showPlaylistsAreaButton.toggleClass('is-disabled', !isButtonEnabled).attr('data-tooltip-text', tooltipText);
    },

    // Can't show the navigation drawer if the user isn't logged in because playlists aren't loaded.
    _isShowPlaylistsAreaButtonEnabled: function() {
      return this.signInManager.has('signedInUser');
    }
  });

  return AppBarView;
});