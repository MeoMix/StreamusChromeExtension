//  Exposed globally so that Chrome Extension's foreground can access through chrome.extension.getBackgroundPage()
var PlayPauseButton = null;

define([
    'streamItems',
    'player'
], function (StreamItems, Player) {
    'use strict';
    
    var playPauseButtonModel = Backbone.Model.extend({
        defaults: {
            enabled: false
        },

        initialize: function () {
            this.listenTo(StreamItems, 'change:selected empty remove', this.toggleEnabled);
            this.toggleEnabled();
        },
        
        toggleEnabled: function() {
            this.set('enabled', StreamItems.where({ selected: true }).length > 0);
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
    
    PlayPauseButton = new playPauseButtonModel;

    return PlayPauseButton;
});