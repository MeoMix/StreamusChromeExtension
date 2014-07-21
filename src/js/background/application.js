define(function() {
    'use strict';
    
    var Application = Backbone.Marionette.Application.extend({
        _showBackground: function() {
            //  Fire up the background:
            require(['background/background']);
        }
    });

    var application = new Application();

    application.addInitializer(function () {
        this.on('start', this._showBackground);
    });

    application.start();
});