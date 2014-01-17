define([
], function() {
    'use strict';

    var ForegroundApplication = new Backbone.Marionette.Application();

    ForegroundApplication.addRegions({
        body: 'body'
    });

    //  Setup modules for initialization. All of these will run when ForegroundApplication.start is called.
    ForegroundApplication.addInitializer(function(options) {
    });

    ForegroundApplication.on('initialize:before', function(options) {
        //  Maybe add more data to options here.
    });

    ForegroundApplication.on('initialize:after', function(options) {
    });

    ForegroundApplication.on('start', function(options) {
    });

    //  This options object is passed to each initialization function and the initialize events.
    ForegroundApplication.start({
        
    });
    
    //  See https://github.com/marionettejs/backbone.wreqr for more information.
    //  This allows for application-wide events which allows modules to be able to communicate
    //  while also being completely ignorant of each other.
    //ForegroundApplication.vent.on('foo', function () { alert('bar'); });
    //ForegroundApplication.vent.trigger('foo');
})