define(function() {
  'use strict';

  var ActivePaneFilter = Backbone.Model.extend({
    defaults: {
      title: chrome.i18n.getMessage('stream'),
      isEnabled: false,
      signInManager: null,
      activePlaylistManager: null
    },

    initialize: function() {
      var signInManager = this.get('signInManager');
      this._setEnabledState(signInManager.get('signedInUser'));
      this.listenTo(signInManager, 'change:signedInUser', this._onSignInManagerChangeSignedInUser);

      var activePlaylistManager = this.get('activePlaylistManager');
      this._setTitle(activePlaylistManager.get('activePlaylist'));
      this.listenTo(activePlaylistManager, 'change:activePlaylist', this._onActivePlaylistManagerChangeActivePlaylist);
    },

    _onSignInManagerChangeSignedInUser: function(model, signedInUser) {
      this._setEnabledState(signedInUser);
    },

    _onActivePlaylistManagerChangeActivePlaylist: function(model, activePlaylist) {
      this._setTitle(activePlaylist);
    },

    _setEnabledState: function(signedInUser) {
      this.set('isEnabled', !_.isNull(signedInUser));
    },

    _setTitle: function(activePlaylist) {
      var title;

      if (_.isNull(activePlaylist)) {
        title = chrome.i18n.getMessage('stream');
      } else {
        title = activePlaylist.get('title');
      }

      this.set('title', title);
    }
  });

  return ActivePaneFilter;
});