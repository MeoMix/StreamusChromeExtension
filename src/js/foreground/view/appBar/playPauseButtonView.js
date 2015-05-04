define(function(require) {
    'use strict';

    var PlayerState = require('common/enum/playerState');
    var KeyboardKey = require('foreground/enum/keyboardKey');
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

            // It's important to watch for keydown events at the window level so that spacebar can trigger play/pause without requiring any UI element to have focus.
            this._onKeyDown = this._onKeyDown.bind(this);
            window.addEventListener('keydown', this._onKeyDown);
        },

        onRender: function() {
            this._setState(this.model.get('enabled'), this.player.get('state'));
        },

        _onClick: function() {
            this.model.tryTogglePlayerState();
        },

        _onKeyDown: function (event) {
            if (document.activeElement === document.body) {
                if (event.keyCode == KeyboardKey.Space) {
                    this._onClick();
                }
            }
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