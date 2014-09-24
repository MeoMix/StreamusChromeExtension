define([
    'backbone',
    'backbone.localStorage',
    'backbone.marionette',
    'chai',
    'jquery.hoverIntent',
    'jquery',
    'jquery.qtip',
    'jquery.transit',
    'jquery-ui',
    'underscore',
    'mocha',
    'selectize',
    'sinon'
], function (Backbone, BackboneLocalStorage, Marionette, chai) {

    window.expect = chai.expect;
    window.mocha.setup('bdd');
    
    //  TODO: This is necessary for tests to work, but how can I make the original one reusable?
    var Application = Backbone.Marionette.Application.extend({
        localDebug: false,
        serverUrl: '',

        initialize: function () {
            this._setServerUrl();
            this.on('start', this._runTests);
        },

        _setServerUrl: function () {
            this.serverUrl = this.localDebug ? 'http://localhost:28029/' : 'https://aws-server.streamus.com/Streamus/';
        },
        
        _runTests: function () {
            //  Finally, load the tests:
            require(['test/test'], function () {
                window.mocha.run();
            });
        }
    });

    var streamus = new Application();
    window.Streamus = streamus;

    streamus.start();
});