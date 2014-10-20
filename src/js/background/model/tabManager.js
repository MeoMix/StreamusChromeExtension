define(function () {
    'use strict';

    var TabManager = Backbone.Model.extend({
        defaults: function () {
            return {
                streamusForegroundUrl: 'chrome-extension://' + chrome.runtime.id + '/foreground.html',
                donateUrl: 'https://streamus.com/#donate',
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
            this._showTab(this.get('donateUrl'));
        },
        
        showKeyboardShortcutsTab: function() {
            this._showTab(this.get('keyboardShortcutsUrl'));
        },
        
        _notifyYouTube: function (data) {
            //  TODO: naming.
            this.messageYouTubeTabs(data);
        },
        
        _notifyBeatport: function (data) {
            this.messageBeatportTabs(data);
        },
        
        _showTab: function (tabUrl) {
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

    return TabManager;
});