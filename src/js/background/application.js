define(function() {
    'use strict';
    
    var Application = Backbone.Marionette.Application.extend({
        initialize: function() {
            this.on('start', this._showBackground);
        },

        _showBackground: function() {
            //  Fire up the background:
            require(['background/background']);
        }
    });

    var application = new Application();
    application.start();
});