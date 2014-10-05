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

        isStreamusTabActive: function (callback) {
            var queryInfo = {
                url: this.get('streamusForegroundUrl'),
                lastFocusedWindow: true
            };

            this._queryTabs(queryInfo, function (tabs) {
                callback(tabs.length > 0);
            });
        },
        
        isStreamusTabOpen: function (callback) {
            var queryInfo = {
                url: this.get('streamusForegroundUrl'),
            };

            this._queryTabs(queryInfo, function (tabs) {
                callback(tabs.length > 0);
            });
        },
        
        showStreamusTab: function () {
            this.showTab(this.get('streamusForegroundUrl'));
        },
        
        showTab: function (tabUrl) {
            var queryInfo = {
                url: tabUrl
            };

            this._queryTabs(queryInfo, function (tabs) {
                if (tabs.length > 0) {
                    //  TODO: This logic isn't supporting the scenario of multiple tabs existing. What happens then? If its in a diff window?
                    var tabDetails = tabs[0];

                    if (!tabDetails.highlighted) {
                        var highlightInfo = {
                            windowId: tabDetails.windowId,
                            tabs: tabDetails.index
                        };

                        this._highlightTabs(highlightInfo);
                    }
                } else {
                    chrome.tabs.create({
                        url: tabUrl
                    });
                }
            }.bind(this));
        },
        
        //  This is sufficient to message all tabs as well as popped-out windows which aren't tabs.
        messageYouTubeTabs: function (message) {
            _.each(this.get('youTubeUrlPatterns'), function (youTubeUrlPattern) {
                var queryInfo = {
                    url: youTubeUrlPattern
                };

                this._queryTabs(queryInfo, function (tabs) {
                    _.each(tabs, function (tab) {
                        chrome.tabs.sendMessage(tab.id, message);
                    });
                });
            }, this);
        },
        
        messageBeatportTabs: function (message) {
            _.each(this.get('beatportUrlPatterns'), function (beatportUrlPattern) {
                var queryInfo = {
                    url: beatportUrlPattern
                };

                this._queryTabs(queryInfo, function (tabs) {
                    _.each(tabs, function (tab) {
                        chrome.tabs.sendMessage(tab.id, message);
                    });
                });
            }, this);
        },
        
        _queryTabs: function (queryInfo, callback) {
            chrome.tabs.query(queryInfo, callback);
        },
        
        _highlightTabs: function (highlightInfo) {
            //  TODO: I reported the fact that this callback is mandatory here: https://code.google.com/p/chromium/issues/detail?id=417564
            chrome.tabs.highlight(highlightInfo, _.noop);
        }
    });

    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.TabManager = new TabManager();
    return window.TabManager;
});