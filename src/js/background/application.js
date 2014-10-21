define([
    'background/model/backgroundArea',
    'background/view/backgroundAreaView'
], function (BackgroundArea, BackgroundAreaView) {
    'use strict';
    
    var Application = Backbone.Marionette.Application.extend({
        localDebug: false,
        serverUrl: '',
        instanceId: '',
        
        regions: {
            backgroundAreaRegion: '#backgroundAreaRegion'
        },
        
        channels: {
            sync: Backbone.Wreqr.radio.channel('sync'),
            tab: Backbone.Wreqr.radio.channel('tab'),
            error: Backbone.Wreqr.radio.channel('error'),
            backgroundNotification: Backbone.Wreqr.radio.channel('backgroundNotification'),
            notification: Backbone.Wreqr.radio.channel('notification'),
            backgroundArea: Backbone.Wreqr.radio.channel('backgroundArea'),
            clipboard: Backbone.Wreqr.radio.channel('clipboard'),
            foreground: Backbone.Wreqr.radio.channel('foreground')
        },

        initialize: function() {
            this._setServerUrl();
            this._setInstanceId();
            this.on('start', this._showBackground);
        },

        _setServerUrl: function () {
            this.serverUrl = this.localDebug ? 'http://localhost:28029/' : 'https://aws-server.streamus.com/Streamus/';
        },
        
        //  A unique identifier for this Streamus instance. Useful for telling logs apart without a signed in user.
        _setInstanceId: function () {
            var instanceId = localStorage.getItem('instanceId');
            
            if (instanceId === null) {
                instanceId = 'instance_' + _.now();
                localStorage.setItem('instanceId', instanceId);
            }

            this.instanceId = instanceId;
        },

        _showBackground: function () {
            this.backgroundAreaRegion.show(new BackgroundAreaView({
                model: new BackgroundArea()
            }));
        }
    });

    $(function() {
        var streamus = new Application();
        window.Streamus = streamus;
        streamus.start();
    });
});