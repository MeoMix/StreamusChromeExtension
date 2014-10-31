define([
    'background/enum/syncActionType'
],function (SyncActionType) {
    'use strict';

    var BrowserSettings = Backbone.Model.extend({
        localStorage: new Backbone.LocalStorage('BrowserSettings'),

        defaults: {
            //  Need to set the ID for Backbone.LocalStorage
            id: 'BrowserSettings',
            showContextMenuOnTextSelection: true,
            showContextMenuOnYouTubeLinks: true,
            showContextMenuOnYouTubePages: true,
            applyWebsiteEnhancementsToYouTube: true,
            applyWebsiteEnhancementsToBeatport: true
        },

        initialize: function () {
            //  Load from Backbone.LocalStorage
            this.fetch();
            
            chrome.runtime.onMessage.addListener(this._onRuntimeMessage.bind(this));
            this.on('change:applyWebsiteEnhancementsToYouTube', this._onChangeApplyWebsiteEnhancementsToYouTube);
            this.on('change:applyWebsiteEnhancementsToBeatport', this._onChangeApplyWebsiteEnhancementsToBeatport);
        },
        
        _onRuntimeMessage: function (request, sender, sendResponse) {
            switch (request.method) {
                case 'getCanEnhanceBeatport':
                    sendResponse(this.get('applyWebsiteEnhancementsToBeatport'));
                    break;
                case 'getYouTubeInjectData':
                    sendResponse({
                        canInject: this.get('applyWebsiteEnhancementsToYouTube'),
                        SyncActionType: SyncActionType
                    });
                    break;
            }
        },
        
        _onChangeApplyWebsiteEnhancementsToYouTube: function (model, enhanceYouTube) {
            Streamus.channels.tab.commands.trigger('notify:youTube', {
                event: enhanceYouTube ? 'enhance-on' : 'enhance-off'
            });
        },
        
        _onChangeApplyWebsiteEnhancementsToBeatport: function (model, enhanceBeatport) {
            Streamus.channels.tab.commands.trigger('notify:beatport', {
                event: enhanceBeatport ? 'enhance-on' : 'enhance-off'
            });
        }
    });

    return BrowserSettings;
});