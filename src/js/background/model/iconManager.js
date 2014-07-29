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
                this._setIcon();
            } else {
                Player.once('change:ready', this._setIcon.bind(this));
            }

            this.listenTo(Player, 'change:muted change:state change:volume', this._setIcon);
        },
        
        //  Set the Streamus icon color and bar count based on the volume level, mutedness and player state.
        //  RED: Player is muted.
        //  GREEN: Player is playing (buffering counts as playing)
        //  Yellow: Player is paused/unstarted
        //  It's important to debounce this because if you spam setIcon it won't update reliably.
        _setIcon: _.debounce(function() {
            var iconColor = this._getIconColor();
            var iconBarCount = this._getIconBarCount();

            chrome.browserAction.setIcon({
                path: '../../img/' + iconColor + '_' + iconBarCount + '.png'
            });
        }, 100),
        
        _getIconColor: function () {
            var iconColor = 'yellow';

            var playerState = Player.get('state');
            var isMuted = Player.get('muted');

            if (isMuted) {
                iconColor = 'red';
            }
            else if (playerState === PlayerState.Playing || playerState === PlayerState.Buffering) {
                iconColor = 'green';
            }

            return iconColor;
        },
        
        _getIconBarCount: function() {
            var volume = Player.get('volume');
            var barCount = Math.ceil((volume / 25));
            return barCount;
        }
    });
    
    return new IconManager();
});