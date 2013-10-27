//  Handles setting and managing the Streamus icon state.
define([
    'player',
    'playerState'
], function (Player, PlayerState) {
    'use strict';

    var IconManager = Backbone.Model.extend({
        //  Begin listening to interesting player events and adjust UI as events happen
        initialize: function () {

            //  Initialize the visual state of the icon once the player is ready and able to provide information.
            var initializeIcon = function () {
                var playerState = Player.get('state');
                var isMuted = Player.get('muted');
                var volume = Player.get('volume');

                console.log("initializing icon:", playerState);

                setIcon(playerState, isMuted, volume);
            };
            
            if (Player.get('ready')) {
                initializeIcon();
            } else {
                Player.once('change:ready', initializeIcon);
            }

            Player.on('change:muted', function (model, isMuted) {

                var playerState = Player.get('state');
                var volume = Player.get('volume');

                setIcon(playerState, isMuted, volume);
            });

            Player.on('change:state', function (model, playerState) {

                var isMuted = Player.get('muted');
                var volume = Player.get('volume');

                setIcon(playerState, isMuted, volume);
            });

            Player.on('change:volume', function (model, volume) {

                var playerState = Player.get('state');
                var isMuted = Player.get('muted');
                
                setIcon(playerState, isMuted, volume);
            });
            
        }
        
    });
    
    //  Set the Streamus icon color and bar count based on the volume level, mutedness and player state.
    //  RED: Player is muted.
    //  GREEN: Player is playing (buffering counts as playing)
    //  Yellow: Player is paused/unstarted
    function setIcon(playerState, isMuted, volume) {
        var iconColor;

        if (isMuted) {
            iconColor = 'Red';
        }
        else if (playerState === PlayerState.PLAYING || playerState === PlayerState.BUFFERING) {
            iconColor = 'Green';
        } else {
            iconColor = 'Yellow';
        }

        console.log("IconColor:", iconColor);

        //  TODO: It would probably be better to implement this using a canvas rather than swapping images.
        var barCount = Math.ceil((volume / 25));

        console.log("Volume:", volume);

        chrome.browserAction.setIcon({
            path: '../../img/' + iconColor + ' ' + barCount + '.png'
        });
    }

    return new IconManager;
});