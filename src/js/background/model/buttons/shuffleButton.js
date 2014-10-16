define(function () {
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
            
            chrome.commands.onCommand.addListener(this._onChromeCommand.bind(this));
        },

        toggleEnabled: function () {
            this.save({
                enabled: !this.get('enabled')
            });
        },

        _onChromeCommand: function (command) {
            if (command === 'toggleShuffle') {
                this.toggleEnabled();
                
                Streamus.channels.backgroundNotification.commands.trigger('show:notification', {
                    //  TODO: i18n
                    message: this.get('enabled') ? 'Shuffling on' : 'Shuffling off'
                });
            }
        }
    });

    return ShuffleButton;
});