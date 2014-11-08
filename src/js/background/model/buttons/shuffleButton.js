define([
    'background/enum/chromeCommand'
], function (ChromeCommand) {
    'use strict';
    
    var ShuffleButton = Backbone.Model.extend({
        localStorage: new Backbone.LocalStorage('ShuffleButton'),
        
        defaults: {
            //  Need to set the ID for Backbone.LocalStorage
            id: 'ShuffleButton',
            enabled: false
        },
        
        initialize: function () {
            //  Load from Backbone.LocalStorage
            this.fetch();
            
            chrome.commands.onCommand.addListener(this._onChromeCommandsCommand.bind(this));
        },

        toggleEnabled: function () {
            this.save({
                enabled: !this.get('enabled')
            });
        },
        
        getStateMessage: function () {
            return this.get('enabled') ? chrome.i18n.getMessage('shufflingEnabled') : chrome.i18n.getMessage('shufflingDisabled');
        },

        _onChromeCommandsCommand: function (command) {
            if (command === ChromeCommand.ToggleShuffle) {
                this.toggleEnabled();
                
                Streamus.channels.backgroundNotification.commands.trigger('show:notification', {
                    message: this.getStateMessage()
                });
            }
        }
    });

    return ShuffleButton;
});