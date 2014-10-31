define([
    'foreground/view/foregroundAreaView'
], function (ForegroundAreaView) {
    'use strict';

    var Application = Backbone.Marionette.Application.extend({
        backgroundPage: null,
        
        regions: {
            foregroundAreaRegion: '#foregroundAreaRegion'
        },
        
        channels: {
            global: Backbone.Wreqr.radio.channel('global'),
            prompt: Backbone.Wreqr.radio.channel('prompt'),
            notification: Backbone.Wreqr.radio.channel('notification'),
            foregroundArea: Backbone.Wreqr.radio.channel('foregroundArea'),
            window: Backbone.Wreqr.radio.channel('window'),
            contextMenu: Backbone.Wreqr.radio.channel('contextMenu'),
            playlistsArea: Backbone.Wreqr.radio.channel('playlistsArea'),
            searchArea: Backbone.Wreqr.radio.channel('searchArea'),
            elementInteractions: Backbone.Wreqr.radio.channel('elementInteractions')
        },
        
        backgroundChannels: null,
        
        initialize: function () {
            this._configureQtip();
            this._setBackgroundPage();
            this._setBackgroundChannels();
            this.on('start', this._onStart);
        },

        //  Configure qTip2's default behavior.
        _configureQtip: function () {
            this._setQtipPositioning();
            this._setQtipStyle();
        },
        
        _setBackgroundPage: function () {
            this.backgroundPage = chrome.extension.getBackgroundPage();
        },
        
        _setBackgroundChannels: function () {
            this.backgroundChannels = {
                error: this.backgroundPage.Backbone.Wreqr.radio.channel('error'),
                notification: this.backgroundPage.Backbone.Wreqr.radio.channel('notification'),
                foreground: this.backgroundPage.Backbone.Wreqr.radio.channel('foreground')
            };
        },
        
        _setQtipPositioning: function () {
            $.extend($.fn.qtip.defaults.position, {
                viewport: $(window),
                my: 'top center',
                at: 'bottom center',
                hide: {
                    leave: false
                }
            });
        },
        
        _setQtipStyle: function() {
            $.extend($.fn.qtip.defaults.style, {
                classes: 'qtip-light qtip-shadow'
            });
        },
        
        _onStart: function () {
            Streamus.backgroundChannels.foreground.vent.trigger('started');

            //  Don't even bother loading the foreground if Streamus should open in a tab instead.
            if (this.backgroundPage.settings.get('alwaysOpenInTab')) {
                this.backgroundPage.tabManager.isStreamusTabOpen(this._onIsStreamusTabOpenResponse.bind(this));
            } else {
                this._showForegroundArea();
            }
        },
        
        _onIsStreamusTabOpenResponse: function (streamusTabOpen) {
            //  At this point the the open tab could be running this code, or the extension might be being opened again with a tab already running.
            if (streamusTabOpen) {
                //  If the popup is closed then we know that the extension isn't trying to open the popup and the code is running to initialize the tab.
                var popupClosed = chrome.extension.getViews({ type: "popup" }).length === 0;
                popupClosed ? this._showForegroundArea() : this._showStreamusTab();
            } else {
                this._showStreamusTab();
            }
        },
        
        _showStreamusTab: function () {
            this.backgroundPage.tabManager.showStreamusTab();
            //  Be sure to close the popup window because if the tab is already open and focused it won't shut.
            window.close();
        },
        
        _showForegroundArea: function () {
            this.foregroundAreaRegion.show(new ForegroundAreaView());
        }
    });
    
    $(function() {
        var streamus = new Application();
        window.Streamus = streamus;
        streamus.start();
    });
});