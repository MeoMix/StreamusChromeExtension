define(function (require) {
    'use strict';

    var ChromeCommand = require('background/enum/chromeCommand');
    
    var RadioButton = Backbone.Model.extend({
        localStorage: new Backbone.LocalStorage('RadioButton'),
        
        defaults: {
            //  Need to set the ID for Backbone.LocalStorage
            id: 'RadioButton',
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
            return this.get('enabled') ? chrome.i18n.getMessage('radioEnabled') : chrome.i18n.getMessage('radioDisabled');
        },
        
        _onChromeCommandsCommand: function (command) {
            if (command === ChromeCommand.ToggleRadio) {
                this.toggleEnabled();

                Streamus.channels.backgroundNotification.commands.trigger('show:notification', {
                    message: this.getStateMessage()
                });
            }
        }
    });

    return RadioButton;
});