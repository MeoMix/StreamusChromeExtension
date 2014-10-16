define(function () {
    'use strict';
    
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
            
            chrome.commands.onCommand.addListener(this._onChromeCommand.bind(this));
        },
 
        toggleEnabled: function () {
            this.save({
                enabled: !this.get('enabled')
            });
        },
        
        _onChromeCommand: function (command) {
            if (command === 'toggleRadio') {
                this.toggleEnabled();

                Streamus.channels.backgroundNotification.commands.trigger('show:notification', {
                    //  TODO: i18n
                    message: this.get('enabled') ? 'Radio on' : 'Radio off'
                });
            }
        }
    });

    return RadioButton;
});