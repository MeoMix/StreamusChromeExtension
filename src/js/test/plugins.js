define(function(require) {
    'use strict';

    require('backbone.marionette');
    require('backbone.localStorage');
    require('jquery.perfectScrollbar');
    require('jquery.qtip');
    require('jquery-ui');
    require('mocha');
    var chai = require('chai');
    require('sinon');

    var Cocktail = require('cocktail');

    window.expect = chai.expect;
    window.mocha.setup('bdd');

    Cocktail.patch(Backbone);

    //  TODO: This is necessary for tests to work, but how can I make the original one reusable?
    var Application = Marionette.Application.extend({
        localDebug: true,
        testing: true,
        serverUrl: '',
        
        //  TODO: Not sure how I am going to handle background/foreground channels.
        channels: {
            global: Backbone.Wreqr.radio.channel('global'),
            dialog: Backbone.Wreqr.radio.channel('dialog'),
            notification: Backbone.Wreqr.radio.channel('notification'),
            foreground: Backbone.Wreqr.radio.channel('foreground'),
            foregroundArea: Backbone.Wreqr.radio.channel('foregroundArea'),
            window: Backbone.Wreqr.radio.channel('window'),
            contextMenu: Backbone.Wreqr.radio.channel('contextMenu'),
            playlistsArea: Backbone.Wreqr.radio.channel('playlistsArea'),
            searchArea: Backbone.Wreqr.radio.channel('searchArea'),
            activeStreamItemArea: Backbone.Wreqr.radio.channel('activeStreamItemArea'),
            element: Backbone.Wreqr.radio.channel('element'),
            saveSongs: Backbone.Wreqr.radio.channel('saveSongs'),
            listItem: Backbone.Wreqr.radio.channel('listItem'),
            simpleMenu: Backbone.Wreqr.radio.channel('simpleMenu'),
            video: Backbone.Wreqr.radio.channel('video'),
            playPauseButton: Backbone.Wreqr.radio.channel('playPauseButton'),

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