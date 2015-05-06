define(function(require) {
    'use strict';

    var BackgroundArea = require('background/model/backgroundArea');
    var BackgroundAreaView = require('background/view/backgroundAreaView');

    var Application = Marionette.Application.extend({
        //  Set this flag to true to enable localhost server & debugging flags.
        localDebug: false,
        //  The URL to which AJAX requests are sent. localhost for debugging or cloud server in production.
        serverUrl: '',
        //  A unique identifier for this Streamus instance. Useful for telling logs apart without a signed in user.
        instanceId: '',
        
        //  All the channels used for global event communication across the page
        channels: {
            tab: Backbone.Wreqr.radio.channel('tab'),
            error: Backbone.Wreqr.radio.channel('error'),
            backgroundNotification: Backbone.Wreqr.radio.channel('backgroundNotification'),
            notification: Backbone.Wreqr.radio.channel('notification'),
            backgroundArea: Backbone.Wreqr.radio.channel('backgroundArea'),
            clipboard: Backbone.Wreqr.radio.channel('clipboard'),
            foreground: Backbone.Wreqr.radio.channel('foreground'),
            player: Backbone.Wreqr.radio.channel('player'),
            activePlaylist: Backbone.Wreqr.radio.channel('activePlaylist')
        },

        initialize: function() {
            this._setServerUrl();
            this._setInstanceId();
            this.on('start', this._onStart);
        },

        _onStart: function() {
            this._showBackgroundArea();
        },

        _setServerUrl: function() {
            this.serverUrl = this.localDebug ? 'http://localhost:39853/' : 'https://aws-server.streamus.com/Streamus/';
        },

        _setInstanceId: function() {
            var instanceId = localStorage.getItem('instanceId');

            if (instanceId === null) {
                instanceId = 'instance_' + _.now();
                localStorage.setItem('instanceId', instanceId);
            }

            this.instanceId = instanceId;
        },

        _showBackgroundArea: function() {
            var backgroundAreaView = new BackgroundAreaView({
                model: new BackgroundArea()
            });

            backgroundAreaView.render();
        }
    });

    var streamus = new Application();
    window.Streamus = streamus;
    streamus.start();
});