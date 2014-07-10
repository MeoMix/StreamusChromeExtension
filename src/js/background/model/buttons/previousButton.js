define([
    'background/collection/streamItems',
    'background/model/player',
    'background/model/buttons/shuffleButton'
], function (StreamItems, Player, ShuffleButton) {
    'use strict';
    
    var PreviousButton = Backbone.Model.extend({
        defaults: {
            enabled: false
        },

        initialize: function () {
            this.listenTo(StreamItems, 'add remove reset change:active sort', this.toggleEnabled);
            this.listenTo(Player, 'change:currentTime', this.toggleEnabled);
            this.listenTo(ShuffleButton, 'change:enabled', this.toggleEnabled);

            this.toggleEnabled();
        },
        
        toggleEnabled: function () {
            var previousItem = StreamItems.getPrevious();
            var playerTime = Player.get('currentTime');

            var enabled = previousItem !== null || playerTime > 3;
            this.set('enabled', enabled);
        },
        
        //  Prevent spamming by only allowing a previous click once every 100ms.
        tryDoTimeBasedPrevious: _.debounce(function () {
            if (this.get('enabled')){

                //  Restart when clicking 'previous' if too much time has passed
                if (Player.get('currentTime') > 5) {
                    Player.seekTo(0);
                } else {
                    StreamItems.activatePrevious();
                }
            }

            return this.get('enabled');
        }, 100, true)
    });
    
    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.PreviousButton = new PreviousButton();
    return window.PreviousButton;
});