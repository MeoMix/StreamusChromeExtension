define(function(require) {
    'use strict';

    var ForegroundAreaView = require('foreground/view/foregroundAreaView');

    var Application = MarionetteForeground.Application.extend({
        backgroundPage: null,

        channels: {
            global: BackboneForeground.Wreqr.radio.channel('global'),
            dialog: BackboneForeground.Wreqr.radio.channel('dialog'),
            notification: BackboneForeground.Wreqr.radio.channel('notification'),
            foreground: BackboneForeground.Wreqr.radio.channel('foreground'),
            foregroundArea: BackboneForeground.Wreqr.radio.channel('foregroundArea'),
            window: BackboneForeground.Wreqr.radio.channel('window'),
            contextMenu: BackboneForeground.Wreqr.radio.channel('contextMenu'),
            playlistsArea: BackboneForeground.Wreqr.radio.channel('playlistsArea'),
            searchArea: BackboneForeground.Wreqr.radio.channel('searchArea'),
            activeStreamItemArea: BackboneForeground.Wreqr.radio.channel('activeStreamItemArea'),
            element: BackboneForeground.Wreqr.radio.channel('element'),
            saveSongs: BackboneForeground.Wreqr.radio.channel('saveSongs'),
            listItem: BackboneForeground.Wreqr.radio.channel('listItem'),
            simpleMenu: BackboneForeground.Wreqr.radio.channel('simpleMenu')
        },

        backgroundChannels: null,

        initialize: function() {
            this._setBackgroundPage();
            this._setBackgroundChannels();
            this.on('start', this._onStart);
        },

        _setBackgroundPage: function() {
            this.backgroundPage = chrome.extension.getBackgroundPage();
        },

        _setBackgroundChannels: function() {
            this.backgroundChannels = {
                error: this.backgroundPage.BackboneForeground.Wreqr.radio.channel('error'),
                notification: this.backgroundPage.BackboneForeground.Wreqr.radio.channel('notification'),
                foreground: this.backgroundPage.BackboneForeground.Wreqr.radio.channel('foreground')
            };
        },

        _onStart: function() {
            Streamus.backgroundChannels.foreground.vent.trigger('started');
            this._showForegroundArea();
        },

        _showForegroundArea: function() {
            var foregroundAreaView = new ForegroundAreaView();
            foregroundAreaView.render();
        }
    });

    var streamus = new Application();
    window.Streamus = streamus;
    streamus.start();
});