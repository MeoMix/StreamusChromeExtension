define([
    'background/collection/streamItems',
    'background/model/player'
], function (StreamItems, Player) {
    'use strict';
    
    //  If the foreground requests, don't instantiate -- return existing from the background.
    if (!_.isUndefined(chrome.extension.getBackgroundPage().window.PlayPauseButton)) {
        return chrome.extension.getBackgroundPage().window.PlayPauseButton;
    }
    
    var PlayPauseButton = Backbone.Model.extend({
        defaults: {
            enabled: false
        },

        initialize: function () {
            this.listenTo(StreamItems, 'change:active remove reset', this.toggleEnabled);
            this.toggleEnabled();
        },
        
        toggleEnabled: function() {
            this.set('enabled', StreamItems.length > 0);
        },
        
        //  Only allow changing once every 100ms to preent spamming.
        tryTogglePlayerState: _.debounce(function () {

            if (this.get('enabled')) {
                
                if (Player.isPlaying()) {
                    Player.pause();
                } else {
                    Player.play();
                }
                
            }

            return this.get('enabled');
            
        }, 100, true)
    });
    
    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.PlayPauseButton = new PlayPauseButton();
    return window.PlayPauseButton;
});