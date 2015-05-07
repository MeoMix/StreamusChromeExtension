define(function(require) {
    'use strict';

    var ChromeCommand = require('background/enum/chromeCommand');

    var TabManager = Backbone.Model.extend({
        defaults: function() {
            return {
                streamusForegroundUrl: 'chrome-extension://' + chrome.runtime.id + '/foreground.html',
                keyboardShortcutsUrl: 'chrome://extensions/configureCommands',
                youTubeUrlPatterns: ['*://*.youtube.com/watch?*', '*://*.youtu.be/*'],
                beatportUrlPatterns: ['*://*.beatport.com/*']
            };
        },

        initialize: function() {
            this.listenTo(Streamus.channels.tab.commands, 'notify:youTube', this._notifyYouTube);
            this.listenTo(Streamus.channels.tab.commands, 'notify:beatport', this._notifyBeatport);
            chrome.commands.onCommand.addListener(this._onChromeCommandsCommand.bind(this));
        },

        isStreamusTabActive: function(callback) {
            var queryInfo = {
                url: this.get('streamusForegroundUrl'),
                lastFocusedWindow: true
            };

            this._queryTabs(queryInfo, function(tabs) {
                callback(tabs.length > 0);
            });
        },

        showStreamusTab: function() {
            this._showTab(this.get('streamusForegroundUrl'));
        },

        showKeyboardShortcutsTab: function() {
            this._showTab(this.get('keyboardShortcutsUrl'));
        },

        _notifyYouTube: function(data) {
            this.messageTabs(this.get('youTubeUrlPatterns'), data);
        },

        _notifyBeatport: function(data) {
            this.messageTabs(this.get('beatportUrlPatterns'), data);
        },

        _showTab: function(urlPattern, url) {
            var queryInfo = {
                url: urlPattern,
                //  It's possible for a tab to be open in another window.
                //  Instead of bringing that window to the foreground -- just assume tab isn't visible.
                currentWindow: true
            };

            this._queryTabs(queryInfo, function(tabDetailsList) {
                if (tabDetailsList.length > 0) {
                    var anyTabHighlighted = _.some(tabDetailsList, function(tabDetails) {
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
        messageTabs: function(urlPatterns, message) {
            _.each(urlPatterns, function(urlPattern) {
                var queryInfo = {
                    url: urlPattern
                };

                this._queryTabs(queryInfo, function(tabs) {
                    _.each(tabs, function(tab) {
                        chrome.tabs.sendMessage(tab.id, message);
                    });
                });
            }, this);
        },

        _queryTabs: function(queryInfo, callback) {
            chrome.tabs.query(queryInfo, callback);
        },

        _highlightTabs: function(highlightInfo) {
            //  TODO: The callback will be optional once Google resolves https://code.google.com/p/chromium/issues/detail?id=417564
            chrome.tabs.highlight(highlightInfo, _.noop);
        },

        _onChromeCommandsCommand: function (command) {
            if (command === ChromeCommand.OpenInTab) {
                this.showStreamusTab();
            }
        }
    });

    return TabManager;
});