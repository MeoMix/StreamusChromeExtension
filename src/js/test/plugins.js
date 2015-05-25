define(function(require) {
    'use strict';

    require('backbone.marionette');
    require('backbone.localStorage');
    require('jquery-ui');
    require('mocha');
    var chai = require('chai');
    require('sinon');

    var Cocktail = require('cocktail');

    window.expect = chai.expect;
    window.mocha.setup('bdd');

    Cocktail.patch(Backbone);

    //  https://github.com/MeoMix/StreamusChromeExtension/issues/563
    var Application = Marionette.Application.extend({
        localDebug: true,
        testing: true,
        serverUrl: '',

        channels: {
            global: Backbone.Wreqr.radio.channel('global'),
            dialog: Backbone.Wreqr.radio.channel('dialog'),
            notification: Backbone.Wreqr.radio.channel('notification'),
            foreground: Backbone.Wreqr.radio.channel('foreground'),
            foregroundArea: Backbone.Wreqr.radio.channel('foregroundArea'),
            window: Backbone.Wreqr.radio.channel('window'),
            simpleMenu: Backbone.Wreqr.radio.channel('simpleMenu'),
            playlistsArea: Backbone.Wreqr.radio.channel('playlistsArea'),
            search: Backbone.Wreqr.radio.channel('search'),
            activeStreamItemArea: Backbone.Wreqr.radio.channel('activeStreamItemArea'),
            element: Backbone.Wreqr.radio.channel('element'),
            listItem: Backbone.Wreqr.radio.channel('listItem'),
            video: Backbone.Wreqr.radio.channel('video'),
            playPauseButton: Backbone.Wreqr.radio.channel('playPauseButton'),
            tooltip: Backbone.Wreqr.radio.channel('tooltip'),
            scrollbar: Backbone.Wreqr.radio.channel('scrollbar'),

            //  BACKGROUND:
            tab: Backbone.Wreqr.radio.channel('tab'),
            error: Backbone.Wreqr.radio.channel('error'),
            backgroundNotification: Backbone.Wreqr.radio.channel('backgroundNotification'),
            //notification: Backbone.Wreqr.radio.channel('notification'),
            backgroundArea: Backbone.Wreqr.radio.channel('backgroundArea'),
            clipboard: Backbone.Wreqr.radio.channel('clipboard'),
            //foreground: Backbone.Wreqr.radio.channel('foreground'),
            player: Backbone.Wreqr.radio.channel('player'),
            activePlaylist: Backbone.Wreqr.radio.channel('activePlaylist')
        },

        backgroundChannels: null,

        initialize: function() {
            this._setServerUrl();
            this._setBackgroundPage();
            this._setBackgroundChannels();
            this.on('start', this._runTests);
        },

        _setServerUrl: function() {
            this.serverUrl = this.localDebug ? 'http://localhost:39853/' : 'https://aws-server.streamus.com/Streamus/';
        },

        _setBackgroundPage: function() {
            this.backgroundPage = chrome.extension.getBackgroundPage();
        },

        _setBackgroundChannels: function() {
            this.backgroundChannels = {
                error: this.backgroundPage.Backbone.Wreqr.radio.channel('error'),
                notification: this.backgroundPage.Backbone.Wreqr.radio.channel('notification'),
                foreground: this.backgroundPage.Backbone.Wreqr.radio.channel('foreground')
            };
        },

        _runTests: function() {
            //  Finally, load the tests:
            require(['test/test'], function() {
                window.mocha.run();
            });
        }
    });

    var streamus = new Application();
    window.Streamus = streamus;

    streamus.start();
});