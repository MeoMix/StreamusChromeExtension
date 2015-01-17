define(function (require) {
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
            enhanceBeatport: true
        },

        initialize: function () {
            //  Load from Backbone.LocalStorage
            this.fetch();
            
            chrome.runtime.onMessage.addListener(this._onChromeRuntimeMessage.bind(this));
            this.on('change:enhanceYouTube', this._onChangeEnhanceYouTube);
            this.on('change:enhanceBeatport', this._onChangeEnhanceBeatport);
        },
        
        _onChromeRuntimeMessage: function (request, sender, sendResponse) {
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
        
        _onChangeEnhanceYouTube: function (model, enhanceYouTube) {
            Streamus.channels.tab.commands.trigger('notify:youTube', {
                event: enhanceYouTube ? 'enhance-on' : 'enhance-off'
            });
        },
        
        _onChangeEnhanceBeatport: function (model, enhanceBeatport) {
            Streamus.channels.tab.commands.trigger('notify:beatport', {
                event: enhanceBeatport ? 'enhance-on' : 'enhance-off'
            });
        }
    });

    return BrowserSettings;
});