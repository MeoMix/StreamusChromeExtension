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

            //  TODO: There's a difference between buffering-->play and buffering-->paused. Don't want to change button when buffering-->paused. How to tell the difference?
            this.ui.pauseIcon.toggleClass('is-hidden', playerState !== PlayerState.Playing && playerState !== PlayerState.Buffering);
            this.ui.playIcon.toggleClass('is-hidden', playerState === PlayerState.Playing || playerState === PlayerState.Buffering);
        }
    });

    return PlayPauseButtonView;
});