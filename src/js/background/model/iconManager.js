//  Handles setting and managing the Streamus icon state.
define([
    'background/model/player',
    'common/enum/playerState'
], function (Player, PlayerState) {
    'use strict';

    var IconManager = Backbone.Model.extend({

        initialize: function () {
            //  Initialize the visual state of the icon once the player is ready and able to provide information.
            if (Player.get('ready')) {
                this.setIcon();
            } else {
                Player.once('change:ready', this.setIcon.bind(this));
            }

            this.listenTo(Player, 'change:muted change:state change:volume', this.setIcon);
        },
        
        //  Set the Streamus icon color and bar count based on the volume level, mutedness and player state.
        //  RED: Player is muted.
        //  GREEN: Player is playing (buffering counts as playing)
        //  Yellow: Player is paused/unstarted
        //  It's important to debounce this because if you spam setIcon it won't update reliably.
        setIcon: _.debounce(function() {
            var iconColor;

            var playerState = Player.get('state');
            var isMuted = Player.get('muted');
            var volume = Player.get('volume');

            if (isMuted) {
                iconColor = 'Red';
            }
            else if (playerState === PlayerState.Playing || playerState === PlayerState.Buffering) {
                iconColor = 'Green';
            } else {
                iconColor = 'Yellow';
            }

            var barCount = Math.ceil((volume / 25));

            chrome.browserAction.setIcon({
                path: '../../img/' + iconColor + ' ' + barCount + '.png'
            });
        }, 100)
        
    });
    
    return new IconManager();
});