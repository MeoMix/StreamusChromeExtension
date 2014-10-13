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

        _showBackground: function () {
            //  TODO: I would like to rewrite my code using the alternative syntax for requireJS, but I need to deal with my singletons first.
            require(['background/model/background', 'background/view/backgroundView'], function (Background, BackgroundView) {

                var backgroundView = new BackgroundView({
                    model: new Background()
                });
            });
        }
    });

    var streamus = new Application();
    window.Streamus = streamus;

    streamus.start();
});