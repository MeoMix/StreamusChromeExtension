define(function(require) {
  'use strict';

  var ForegroundAreaView = require('foreground/view/foregroundAreaView');

  var Application = Marionette.Application.extend({
    backgroundPage: null,
    backgroundChannels: null,

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

    initialize: function(options) {
      this.backgroundPage = options.backgroundProperties;
      this.backgroundChannels = options.backgroundChannels;
      this.on('start', this._onStart);
    },

    _onStart: function() {
      StreamusFG.backgroundChannels.foreground.vent.trigger('started');
      this._showForegroundArea();
    },

    _showForegroundArea: function() {
      var foregroundAreaView = new ForegroundAreaView({
        player: StreamusFG.backgroundProperties.player,
        settings: StreamusFG.backgroundProperties.settings,
        analyticsManager: StreamusFG.backgroundProperties.analyticsManager
      });
      foregroundAreaView.render();
    }
  });

  return Application;
});