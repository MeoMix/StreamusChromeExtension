define(function(require) {
  'use strict';

  var SongQuality = require('common/enum/songQuality');
  var DesktopNotificationDuration = require('common/enum/desktopNotificationDuration');

  var Settings = Backbone.Model.extend({
    localStorage: new Backbone.LocalStorage('Settings'),

    defaults: {
      // Need to set the ID for Backbone.LocalStorage
      id: 'Settings',
      songQuality: SongQuality.Auto,
      remindClearStream: true,
      remindDeletePlaylist: true,
      remindLinkUserId: true,
      remindGoogleSignIn: true,
      openToSearch: false,
      openInTab: false,
      desktopNotificationsEnabled: true,
      desktopNotificationDuration: DesktopNotificationDuration.ThreeSeconds
    },

    initialize: function() {
      // Load from Backbone.LocalStorage
      this.fetch();
    }
  });

  return Settings;
});