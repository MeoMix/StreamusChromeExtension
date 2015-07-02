define(function(require) {
  'use strict';

  var PlayerState = require('common/enum/playerState');

  var ChromeIconManager = Backbone.Model.extend({
    defaults: {
      player: null,
      streamItems: null,
      settings: null,
      tabManager: null
    },

    initialize: function() {
      var player = this.get('player');

      this.listenTo(player, {
        'change:muted': this._onPlayerChangeMuted,
        'change:state': this._onPlayerChangeState,
        'change:volume': this._onPlayerChangeVolume
      });

      var streamItems = this.get('streamItems');
      this.listenTo(streamItems, 'change:active', this._onStreamItemsChangeActive);

      var settings = this.get('settings');
      this.listenTo(settings, 'change:openInTab', this._onSettingsChangeOpenInTab);

      this._setTitle(streamItems.getActiveItem(), player.get('state'), player.get('volume'));
      this._setIcon(player.get('muted'), player.get('volume'));
      this._setPopup(settings.get('openInTab'));

      chrome.browserAction.onClicked.addListener(this._onChromeBrowserActionClicked.bind(this));
    },

    // This event handler will only run when browserAction's popup is string.empty.
    _onChromeBrowserActionClicked: function() {
      this.get('tabManager').showStreamusTab();
    },

    _onPlayerChangeMuted: function(model, muted) {
      this._setIcon(muted, model.get('volume'));
    },

    _onPlayerChangeState: function(model, state) {
      this._setIcon(model.get('muted'), model.get('volume'));
      this._setTitle(this.get('streamItems').getActiveItem(), state, model.get('volume'));
    },

    _onPlayerChangeVolume: function(model, volume) {
      this._setIcon(model.get('muted'), volume);
      this._setTitle(this.get('streamItems').getActiveItem(), model.get('state'), volume);
    },

    _onStreamItemsChangeActive: function(model, active) {
      if (active) {
        var player = this.get('player');
        this._setTitle(model, player.get('state'), player.get('volume'));
      }
    },

    _onSettingsChangeOpenInTab: function(model, openInTab) {
      this._setPopup(openInTab);
    },

    // Disable the popup when opening in a tab so the foreground doesn't flicker as the tab is opening.
    _setPopup: function(openInTab) {
      chrome.browserAction.setPopup({
        popup: openInTab ? '' : 'foreground.html'
      });
    },

    _setTitle: function(activeStreamItem, playerState, volume) {
      var title;
      if (_.isUndefined(activeStreamItem)) {
        title = chrome.i18n.getMessage('streamEmpty');
      } else {
        var playerStateMessage = this._getPlayerStateMessage(playerState);
        title = playerStateMessage + activeStreamItem.get('title');
      }

      chrome.browserAction.setTitle({
        title: title + '\n' + chrome.i18n.getMessage('volume') + ': ' + volume + '%'
      });
    },

    _getPlayerStateMessage: function(playerState) {
      var playerStateMessage;

      if (playerState === PlayerState.Playing) {
        playerStateMessage = chrome.i18n.getMessage('playing') + ': ';
      } else if (playerState === PlayerState.Buffering) {
        playerStateMessage = chrome.i18n.getMessage('buffering') + ': ';
      } else {
        playerStateMessage = chrome.i18n.getMessage('paused') + ': ';
      }

      return playerStateMessage;
    },

    // Set the Streamus icon color and bar count based on the volume level, mutedness and player state.
    // RED: Player is muted.
    // GREEN: Player is playing (buffering counts as playing)
    // Yellow: Player is paused/unstarted
    // Debounce because setIcon acts inappropriately when called quickly and repeatedly.
    // https://code.google.com/p/chromium/issues/detail?id=383714
    _setIcon: _.debounce(function(isMuted, volume) {
      var iconColor = this._getIconColor(isMuted);
      var iconBarCount = this._getIconBarCount(volume);
      var iconBasePath = '../../img/' + iconColor + '_' + iconBarCount + 'bar_';

      chrome.browserAction.setIcon({
        path: {
          19: iconBasePath + '19.png',
          38: iconBasePath + '38.png'
        }
      });
    }, 100),

    _getIconColor: function(isMuted) {
      var iconColor = 'yellow';

      if (isMuted) {
        iconColor = 'red';
      } else if (this.get('player').isPausable()) {
        iconColor = 'green';
      }

      return iconColor;
    },

    _getIconBarCount: function(volume) {
      return Math.ceil((volume / 25));
    }
  });

  return ChromeIconManager;
});