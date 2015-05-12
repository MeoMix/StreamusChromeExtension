define(function(require) {
    'use strict';

    var PlayerState = require('common/enum/playerState');
    var PlayPauseButtonTemplate = require('text!template/appBar/playPauseButton.html');
    var PauseIconTemplate = require('text!template/icon/pauseIcon_30.svg');
    var PlayIconTemplate = require('text!template/icon/playIcon_30.svg');

    var PlayPauseButtonView = Marionette.ItemView.extend({
        id: 'playPauseButton',
        className: 'button button--icon button--icon--primary button--large',
        template: _.template(PlayPauseButtonTemplate),

        templateHelpers: {
            pauseIcon: _.template(PauseIconTemplate)(),
            playIcon: _.template(PlayIconTemplate)()
        },

        ui: function() {
            return {
                playIcon: '#' + this.id + '-playIcon',
                pauseIcon: '#' + this.id + '-pauseIcon'
            };
        },

        events: {
            'click': '_onClick'
        },

        modelEvents: {
            'change:enabled': '_onChangeEnabled'
        },

        player: null,

        initialize: function() {
            this.player = Streamus.backgroundPage.player;
            this.listenTo(this.player, 'change:state', this._onPlayerChangeState);

            this.listenTo(Streamus.channels.playPauseButton.commands, 'tryToggle:playerState', this._tryTogglePlayerState);
        },

        onRender: function() {
            this._setState(this.model.get('enabled'), this.player.get('state'));
        },

        _onClick: function() {
            this._tryTogglePlayerState();
        },

        _tryTogglePlayerState: function(){
            this.model.tryTogglePlayerState();
        },

        _onChangeEnabled: function(model, enabled) {
            this._setState(enabled, this.player.get('state'));
        },

        _onPlayerChangeState: function(model, state) {
            this._setState(this.model.get('enabled'), state);
        },

        _setState: function(enabled, playerState) {
            this.$el.toggleClass('is-disabled', !enabled);

            //  If the player is playing then the pause icon clearly needs to be shown.
            var showPauseIcon = playerState === PlayerState.Playing;

            //  TODO: This still flickers when first loading the stream because there's a slight 'buffering' that isnt' user-initiated.
            //  However, if the player is buffering, then it's not so simple. The player might be buffering and paused/unstarted.
            if (playerState === PlayerState.Buffering) {
                var previousState = this.player.get('previousState');

                //  When seeking it's even more complicated. The seek might result in the player beginning playback, or remaining paused.
                var wasPlaying = previousState === PlayerState.Playing || previousState === PlayerState.Buffering;

                if (this.player.get('seeking') && !wasPlaying) {
                    showPauseIcon = false;
                } else {
                    showPauseIcon = true;
                }
            }

            this.ui.pauseIcon.toggleClass('is-hidden', !showPauseIcon);
            this.ui.playIcon.toggleClass('is-hidden', showPauseIcon);
        }
    });

    return PlayPauseButtonView;
});