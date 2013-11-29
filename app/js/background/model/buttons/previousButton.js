//  Exposed globally so that Chrome Extension's foreground can access through chrome.extension.getBackgroundPage()
var PreviousButton = null;

define([
    'streamItems',
    'player'
], function (StreamItems, Player) {
    'use strict';

    var previousButtonModel = Backbone.Model.extend({
        defaults: {
            enabled: false
        },

        initialize: function () {
            this.listenTo(StreamItems, 'add addMultiple empty remove', this.toggleEnabled);
            this.toggleEnabled();
        },
        
        toggleEnabled: function () {
            this.set('enabled', StreamItems.length !== 0);
        },
        
        //  Prevent spamming by only allowing a previous click once every 100ms.
        tryDoTimeBasedPrevious: _.debounce(function () {

            if (this.get('enabled')){

                // Restart video when clicking 'previous' if too much time has passed or if no other video to go to
                if (StreamItems.length === 1 || Player.get('currentTime') > 5) {
                    Player.seekTo(0);
                } else {

                    StreamItems.selectPrevious();
                }
            }

            return this.get('enabled');

        }, 100, true)
    });

    PreviousButton = new previousButtonModel;

    return PreviousButton;
});