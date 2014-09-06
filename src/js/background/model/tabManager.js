define(function () {
    'use strict';

    var TabManager = Backbone.Model.extend({
        defaults: function() {
            return {
                streamusForegroundUrl: 'chrome-extension://jbnkffmindojffecdhbbmekbmkkfpmjd/foreground.html',
                youTubeUrlPatterns: ['*://*.youtube.com/watch?*', '*://*.youtu.be/*']
            };
        },

        isStreamusTabOpen: function (callback) {
            this._isTabOpen(this.get('streamusForegroundUrl'), callback);
        },
        
        showStreamusTab: function () {
            this.showTab(this.get('streamusForegroundUrl'));
        },
        
        showTab: function (tabUrl) {
            this._isTabOpen(tabUrl, function (tabIsOpen, tabDetails) {
                if (tabIsOpen) {
                    if (!tabDetails.highlighted) {
                        chrome.tabs.highlight({
                            windowId: tabDetails.windowId,
                            tabs: tabDetails.index
                        }, function () {
                            //  TODO: Use callback for something? Can't remove or chrome throws an error.
                        });
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
        
        //  TODO: Doesn't make much sense that isTabOpen returns tabDetails -- should split off into another method in the future.
        _isTabOpen: function (url, callback) {
            this._queryTabs(url, function(tabs) {
                callback(tabs.length > 0, tabs[0]);
            });
        },
        
        _queryTabs: function(url, callback) {
            chrome.tabs.query({ url: url }, callback);
        }
    });

    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.TabManager = new TabManager();
    return window.TabManager;
});