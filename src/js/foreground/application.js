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
            foreground: Backbone.Wreqr.radio.channel('foreground'),
            foregroundArea: Backbone.Wreqr.radio.channel('foregroundArea'),
            window: Backbone.Wreqr.radio.channel('window'),
            contextMenu: Backbone.Wreqr.radio.channel('contextMenu'),
            playlistsArea: Backbone.Wreqr.radio.channel('playlistsArea'),
            searchArea: Backbone.Wreqr.radio.channel('searchArea'),
            element: Backbone.Wreqr.radio.channel('element')
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
            $.extend($.fn.qtip.defaults.position, {
                viewport: $(window),
                my: 'top center',
                at: 'bottom center'
            });

            $.extend($.fn.qtip.defaults.show, {
                delay: 200
            });
            
            $.extend($.fn.qtip.defaults.style, {
                classes: 'qtip-light qtip-shadow'
            });
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

        _onStart: function () {
            Streamus.backgroundChannels.foreground.vent.trigger('started');
            this._showForegroundArea();
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