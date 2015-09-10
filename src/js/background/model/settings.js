import {Model} from 'backbone';
import LocalStorage from 'lib/backbone.localStorage';
import VideoQuality from 'common/enum/videoQuality';
import DesktopNotificationDuration from 'common/enum/desktopNotificationDuration';
import SyncActionType from 'background/enum/syncActionType';
import LayoutType from 'common/enum/layoutType';

var Settings = Model.extend({
  localStorage: new LocalStorage('Settings'),

  defaults: {
    // Need to set the ID for Backbone.LocalStorage
    id: 'Settings',
    videoQuality: VideoQuality.Auto,
    remindClearStream: true,
    remindDeletePlaylist: true,
    remindLinkUserId: true,
    remindGoogleSignIn: true,
    openInTab: false,
    layoutType: LayoutType.SplitPane,
    desktopNotificationsEnabled: true,
    desktopNotificationDuration: DesktopNotificationDuration.ThreeSeconds,
    showTextSelectionContextMenu: true,
    showYouTubeLinkContextMenu: true,
    showYouTubePageContextMenu: true,
    enhanceYouTube: true,
    enhanceBeatport: true,
    enhanceBeatportPermission: {
      origins: ['*://*.pro.beatport.com/*']
    }
  },

  // Don't save permission objects because they can't change
  blacklist: ['enhanceYouTubePermission', 'enhanceBeatportPermission'],
  toJSON: function() {
    return this.omit(this.blacklist);
  },

  initialize: function() {
    // Load from Backbone.LocalStorage
    this.fetch();

    this._ensurePermission('enhanceBeatport');

    chrome.runtime.onMessage.addListener(this._onChromeRuntimeMessage.bind(this));
    this.on('change:enhanceYouTube', this._onChangeEnhanceYouTube);
    this.on('change:enhanceBeatport', this._onChangeEnhanceBeatport);
  },

  _onChromeRuntimeMessage: function(request, sender, sendResponse) {
    switch (request.method) {
      case 'getBeatportContentScriptData':
        sendResponse({
          canEnhance: this.get('enhanceBeatport')
        });
        break;
      case 'getYouTubeContentScriptData':
        sendResponse({
          canEnhance: this.get('enhanceYouTube'),
          SyncActionType: SyncActionType
        });
        break;
    }
  },

  _onChangeEnhanceYouTube: function(model, enhanceYouTube) {
    this._notifyTab('youTube', enhanceYouTube);
  },

  _onChangeEnhanceBeatport: function(model, enhanceBeatport) {
    this._handleEnhanceChangeRequest(enhanceBeatport, 'beatport', 'enhanceBeatport');
  },

  _handleEnhanceChangeRequest: function(enhance, tabName, permissionName) {
    var permission = this.get(permissionName + 'Permission');

    // If the user wants to enhance a website they need to have granted permission
    if (enhance) {
      var response = this._onChromePermissionContainsResponse.bind(this, permissionName, tabName);
      chrome.permissions.contains(permission, response);
    } else {
      // Cleanup permission if they disable functionality.
      this._notifyTab(tabName, enhance);
      chrome.permissions.remove(permission);
    }
  },

  _onChromePermissionContainsResponse: function(permissionName, tabName, hasPermission) {
    // If permission is granted then perform the enhance logic by notifying open tabs.
    // Otherwise, request permission and, if given, do the same thing. If not granted, disable the permission.
    if (hasPermission) {
      this._notifyTab(tabName, true);
    } else {
      var permission = this.get(permissionName + 'Permission');

      chrome.permissions.request(permission, function(permissionGranted) {
        if (permissionGranted) {
          this._notifyTab(tabName, true);
        } else {
          this.save(permissionName, false);
        }
      }.bind(this));
    }
  },

  _ensurePermission: function(permissionName) {
    // Disable setting if permission has not been granted.
    if (this.get(permissionName)) {
      var permission = this.get(permissionName + 'Permission');
      chrome.permissions.contains(permission, function(hasPermission) {
        if (!hasPermission) {
          this.save(permissionName, false);
        }
      }.bind(this));
    }
  },

  _notifyTab: function(tabType, enhance) {
    StreamusBG.channels.tab.commands.trigger('notify:' + tabType, {
      action: 'toggleContentScript',
      value: enhance
    });
  }
});

export default Settings;