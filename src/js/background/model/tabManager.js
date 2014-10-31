define(function () {
    'use strict';

    var TabManager = Backbone.Model.extend({
        defaults: function () {
            return {
                streamusForegroundUrl: 'chrome-extension://' + chrome.runtime.id + '/foreground.html',
                donateUrl: 'https://streamus.com/#donate',
                //  TODO: chrome.tabs can't match on fragment identifiers. Fix this once website is redone without using fragments for each page.
                donateUrlPattern: '*://streamus.com/*',
                keyboardShortcutsUrl: 'chrome://extensions/configureCommands',
                youTubeUrlPatterns: ['*://*.youtube.com/watch?*', '*://*.youtu.be/*'],
                beatportUrlPatterns: ['*://*.beatport.com/*']
            };
        },
        
        initialize: function () {
            this.listenTo(Streamus.channels.tab.commands, 'notify:youTube', this._notifyYouTube);
            this.listenTo(Streamus.channels.tab.commands, 'notify:beatport', this._notifyBeatport);
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
            this._showTab(this.get('streamusForegroundUrl'));
        },
        
        showDonateTab: function () {
            this._showTab(this.get('donateUrlPattern'), this.get('donateUrl'));
        },
        
        showKeyboardShortcutsTab: function() {
            this._showTab(this.get('keyboardShortcutsUrl'));
        },
        
        _notifyYouTube: function (data) {
            this.messageYouTubeTabs(data);
        },
        
        _notifyBeatport: function (data) {
            this.messageBeatportTabs(data);
        },
        
        _showTab: function (urlPattern, url) {
            var queryInfo = {
                url: urlPattern
            };

            this._queryTabs(queryInfo, function (tabDetailsList) {
                if (tabDetailsList.length > 0) {
                    var anyTabHighlighted = _.some(tabDetailsList, function (tabDetails) {
                        return tabDetails.highlighted;
                    });

                    if (!anyTabHighlighted) {
                        //  Just use the first tab if none are highlighted -- all tabs which match the URL pattern are the same.
                        var firstTabDetails = tabDetailsList[0];

                        var highlightInfo = {
                            windowId: firstTabDetails.windowId,
                            tabs: firstTabDetails.index
                        };

                        this._highlightTabs(highlightInfo);
                    }
                } else {
                    chrome.tabs.create({
                        //  If a specific URL is provided then use it, otherwise assume the URL pattern is the URL.
                        url: url || urlPattern
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
            //  NOTE: I reported the fact that this callback is mandatory here: https://code.google.com/p/chromium/issues/detail?id=417564
            chrome.tabs.highlight(highlightInfo, _.noop);
        }
    });

    return TabManager;
});