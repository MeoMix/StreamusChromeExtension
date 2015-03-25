define(function(require) {
    'use strict';

    var SyncActionType = require('background/enum/syncActionType');

    var BrowserSettings = Backbone.Model.extend({
        localStorage: new Backbone.LocalStorage('BrowserSettings'),

        defaults: {
            //  Need to set the ID for Backbone.LocalStorage
            id: 'BrowserSettings',
            //  TODO: These variables are really long still. How can I make them shorter?
            showTextSelectionContextMenu: true,
            showYouTubeLinkContextMenu: true,
            showYouTubePageContextMenu: true,
            enhanceYouTube: true,
            enhanceBeatport: true,
            enhanceBeatportPermission: {
                origins: ['*://*.pro.beatport.com/*']
            }
        },
        
        //  Don't save enhanceBeatportPermission because it can't change
        blacklist: ['enhanceBeatportPermission'],
        toJSON: function() {
            return this.omit(this.blacklist);
        },

        initialize: function() {
            //  Load from Backbone.LocalStorage
            this.fetch();

            this._ensureBeatportPermission();

            chrome.runtime.onMessage.addListener(this._onChromeRuntimeMessage.bind(this));
            this.on('change:enhanceYouTube', this._onChangeEnhanceYouTube);
            this.on('change:enhanceBeatport', this._onChangeEnhanceBeatport);
        },

        _onChromeRuntimeMessage: function(request, sender, sendResponse) {
            switch (request.method) {
                case 'getBeatportInjectData':
                    sendResponse({
                        canEnhance: this.get('enhanceBeatport')
                    });
                    break;
                case 'getYouTubeInjectData':
                    sendResponse({
                        canEnhance: this.get('enhanceYouTube'),
                        SyncActionType: SyncActionType
                    });
                    break;
            }
        },

        _onChangeEnhanceYouTube: function(model, enhanceYouTube) {
            Streamus.channels.tab.commands.trigger('notify:youTube', {
                event: enhanceYouTube ? 'enhance-on' : 'enhance-off'
            });
        },

        _onChangeEnhanceBeatport: function(model, enhanceBeatport) {
            //  If the user wants to enhance beatport they need to have granted permission
            if (enhanceBeatport) {
                var permission = this.get('enhanceBeatportPermission');
                chrome.permissions.contains(permission, this._onChromePermissionContainsResponse.bind(this, permission));
            } else {
                this._notifyBeatport(enhanceBeatport);
            }
        },
        
        _onChromePermissionContainsResponse: function(permission, hasPermission) {
            if (hasPermission) {
                this._notifyBeatport(enhanceBeatport);
            } else {
                chrome.permissions.request(permission, this._onChromePermissionRequestResponse.bind(this));
            }
        },
        
        _onChromePermissionRequestResponse: function(permissionGranted) {
            if (permissionGranted) {
                this._notifyBeatport(true);
            } else {
                this.save('enhanceBeatport', false);
            }
        },
        
        _ensureBeatportPermission: function() {
            if (this.get('enhanceBeatport')) {
                //  Disable setting if permission has not been granted.
                var permission = this.get('enhanceBeatportPermission');
                chrome.permissions.contains(permission, function(hasPermission) {
                    if (!hasPermission) {
                        this.save('enhanceBeatport', false);
                    }
                }.bind(this));
            }
        },
        
        _notifyBeatport: function(enhanceBeatport) {
            Streamus.channels.tab.commands.trigger('notify:beatport', {
                event: enhanceBeatport ? 'enhance-on' : 'enhance-off'
            });
        }
    });

    return BrowserSettings;
});