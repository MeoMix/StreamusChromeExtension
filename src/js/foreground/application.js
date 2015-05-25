define(function(require) {
  'use strict';

  var ForegroundAreaView = require('foreground/view/foregroundAreaView');

  var Application = Marionette.Application.extend({
    backgroundPage: null,

    channels: {
      global: Backbone.Wreqr.radio.channel('global'),
      dialog: Backbone.Wreqr.radio.channel('dialog'),
      notification: Backbone.Wreqr.radio.channel('notification'),
      foreground: Backbone.Wreqr.radio.channel('foreground'),
      foregroundArea: Backbone.Wreqr.radio.channel('foregroundArea'),
      window: Backbone.Wreqr.radio.channel('window'),
      playlistsArea: Backbone.Wreqr.radio.channel('playlistsArea'),
      search: Backbone.Wreqr.radio.channel('search'),
      activeStreamItemArea: Backbone.Wreqr.radio.channel('activeStreamItemArea'),
      element: Backbone.Wreqr.radio.channel('element'),
      listItem: Backbone.Wreqr.radio.channel('listItem'),
      simpleMenu: Backbone.Wreqr.radio.channel('simpleMenu'),
      video: Backbone.Wreqr.radio.channel('video'),
      playPauseButton: Backbone.Wreqr.radio.channel('playPauseButton'),
      tooltip: Backbone.Wreqr.radio.channel('tooltip'),
      scrollbar: Backbone.Wreqr.radio.channel('scrollbar')
    },

    backgroundChannels: null,

    initialize: function() {
      this._setBackgroundPage();
      this._setBackgroundChannels();
      this.on('start', this._onStart);
    },

    _setBackgroundPage: function() {
      this.backgroundPage = chrome.extension.getBackgroundPage();
    },

    _setBackgroundChannels: function() {
      this.backgroundChannels = {
        error: this.backgroundPage.Backbone.Wreqr.radio.channel('error'),
        notification: this.backgroundPage.Backbone.Wreqr.radio.channel('notification'),
        foreground: this.backgroundPage.Backbone.Wreqr.radio.channel('foreground')
      };
    },

    _onStart: function() {
      Streamus.backgroundChannels.foreground.vent.trigger('started');
      this._showForegroundArea();
    },

    _showForegroundArea: function() {
      var foregroundAreaView = new ForegroundAreaView({
        player: Streamus.backgroundPage.player,
        settings: Streamus.backgroundPage.settings,
        analyticsManager: Streamus.backgroundPage.analyticsManager
      });
      foregroundAreaView.render();
    }
  });

  var streamus = new Application();
  window.Streamus = streamus;
  streamus.start();
});