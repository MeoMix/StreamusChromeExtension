define(function() {
    'use strict';
    
    var Application = Backbone.Marionette.Application.extend({
        localDebug: false,
        serverUrl: '',

        initialize: function() {
            this._setServerUrl();
            this.on('start', this._showBackground);
        },
        
        _setServerUrl: function () {
            this.serverUrl = this.localDebug ? 'http://localhost:28029/' : 'https://aws-server.streamus.com/Streamus/';
        },

        _showBackground: function() {
            //  Fire up the background:
            require(['background/background']);
        }
    });

    var streamus = new Application();
    window.Streamus = streamus;
    
    streamus.start();
});