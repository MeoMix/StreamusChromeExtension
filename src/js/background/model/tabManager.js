define(function () {
    'use strict';

    var TabManager = Backbone.Model.extend({
        defaults: function() {
            return {
                streamusForegroundUrl: 'chrome-extension://jbnkffmindojffecdhbbmekbmkkfpmjd/foreground.html',
                youTubeUrlPatterns: ['*://*.youtube.com/watch?*', '*://*.youtu.be/*'],
                beatportUrlPatterns: ['*://*.beatport.com/*']
            };
        },

        isStreamusTabOpen: function (callback) {
            this._queryTabs(this.get('streamusForegroundUrl'), function(tabs) {
                callback(tabs.length > 0);
            });
        },
        
        showStreamusTab: function () {
            this.showTab(this.get('streamusForegroundUrl'));
        },
        
        showTab: function (tabUrl) {
            this._queryTabs(tabUrl, function (tabs) {
                if (tabs.length > 0) {
                    var tabDetails = tabs[0];

                    if (!tabDetails.highlighted) {
                        //  TODO: I reported the fact that this callback is mandatory here: https://code.google.com/p/chromium/issues/detail?id=417564
                        chrome.tabs.highlight({
                            windowId: tabDetails.windowId,
                            tabs: tabDetails.index
                        }, _.noop);
                    }
                } else {
                    chrome.tabs.create({
                        url: tabUrl
                    });
                }
            });
        },
        
        //  This is sufficient to message all tabs as well as popped-out windows which aren't tabs.
        messageYouTubeTabs: function (message) {
            _.each(this.get('youTubeUrlPatterns'), function (youTubeUrlPattern) {
                this._queryTabs(youTubeUrlPattern, function (tabs) {
                    _.each(tabs, function (tab) {
                        chrome.tabs.sendMessage(tab.id, message);
                    });
                });
            }, this);
        },
        
        messageBeatportTabs: function (message) {
            _.each(this.get('beatportUrlPatterns'), function (beatportUrlPattern) {
                this._queryTabs(beatportUrlPattern, function (tabs) {
                    _.each(tabs, function (tab) {
                        chrome.tabs.sendMessage(tab.id, message);
                    });
                });
            }, this);
        },
        
        _queryTabs: function(url, callback) {
            chrome.tabs.query({ url: url }, callback);
        }
    });

    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.TabManager = new TabManager();
    return window.TabManager;
});