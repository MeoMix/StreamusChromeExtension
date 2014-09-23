define([
    'background/model/tabManager'
], function (TabManager) {
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
                case 'getCanEnhanceYouTube':
                    sendResponse(this.get('applyWebsiteEnhancementsToYouTube'));
                break;
            }
        },
        
        _onChangeApplyWebsiteEnhancementsToYouTube: function(model, enhanceYouTube) {
            TabManager.messageYouTubeTabs({
                event: enhanceYouTube ? 'enhance-on' : 'enhance-off'
            });
        },
        
        _onChangeApplyWebsiteEnhancementsToBeatport: function (model, enhanceBeatport) {
            TabManager.messageBeatportTabs({
                event: enhanceBeatport ? 'enhance-on' : 'enhance-off'
            });
        }
    });

    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.BrowserSettings = new BrowserSettings();
    return window.BrowserSettings;
});