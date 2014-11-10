define([
    'backbone',
    'backbone.localStorage',
    'backbone.marionette',
    'chai',
    'cocktail',
    'jquery',
    'jquery.qtip',
    'jquery-ui',
    'underscore',
    'mocha',
    'selectize',
    'sinon'
], function (Backbone, BackboneLocalStorage, Marionette, chai, Cocktail) {

    window.expect = chai.expect;
    window.mocha.setup('bdd');

    Cocktail.patch(Backbone);
    
    //  TODO: This is necessary for tests to work, but how can I make the original one reusable?
    var Application = Backbone.Marionette.Application.extend({
        localDebug: true,
        testing: true,
        serverUrl: '',
        
        //  TODO: Not sure how I am going to handle background/foreground channels.
        channels: {
            global: Backbone.Wreqr.radio.channel('global'),
            prompt: Backbone.Wreqr.radio.channel('prompt'),
            notification: Backbone.Wreqr.radio.channel('notification'),
            foregroundArea: Backbone.Wreqr.radio.channel('foregroundArea'),
            window: Backbone.Wreqr.radio.channel('window'),
            contextMenu: Backbone.Wreqr.radio.channel('contextMenu'),
            
            //  BACKGROUND:
            sync: Backbone.Wreqr.radio.channel('sync'),
            tab: Backbone.Wreqr.radio.channel('tab'),
            error: Backbone.Wreqr.radio.channel('error'),
            backgroundNotification: Backbone.Wreqr.radio.channel('backgroundNotification'),
            //notification: Backbone.Wreqr.radio.channel('notification'),
            backgroundArea: Backbone.Wreqr.radio.channel('backgroundArea'),
            clipboard: Backbone.Wreqr.radio.channel('clipboard'),
            foreground: Backbone.Wreqr.radio.channel('foreground')
        },
        
        backgroundChannels: null,

        initialize: function () {
            this._setServerUrl();
            this._setBackgroundPage();
            this._setBackgroundChannels();
            this.on('start', this._runTests);
        },

        _setServerUrl: function () {
            this.serverUrl = this.localDebug ? 'http://localhost:28029/' : 'https://aws-server.streamus.com/Streamus/';
        },
        
        _setBackgroundPage: function() {
            this.backgroundPage = chrome.extension.getBackgroundPage();
        },
        
        _setBackgroundChannels: function () {
            this.backgroundChannels = {
                error: this.backgroundPage.Backbone.Wreqr.radio.channel('error'),
                notification: this.backgroundPage.Backbone.Wreqr.radio.channel('notification'),
                foreground: this.backgroundPage.Backbone.Wreqr.radio.channel('foreground')
            };
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