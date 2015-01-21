﻿define(function (require) {
    'use strict';

    var PlayerState = require('common/enum/playerState');
    var PlayPauseButtonTemplate = require('text!template/appBar/playPauseButton.html');

    var PlayPauseButtonView = Marionette.ItemView.extend({
        id: 'playPauseButton',
        className: 'button button--icon button--icon--primary button--large',
        template: _.template(PlayPauseButtonTemplate),
        
        ui: function () {
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
        
        initialize: function () {
            this.player = Streamus.backgroundPage.player;
            this.listenTo(this.player, 'change:state', this._onPlayerChangeState);
        },

        onRender: function () {
            this._setState(this.model.get('enabled'), this.player.get('state'));
        },

        _onClick: function () {
            this.model.tryTogglePlayerState();
        },

        _onChangeEnabled: function (model, enabled) {
            this._setState(enabled, this.player.get('state'));
        },
        
        _onPlayerChangeState: function (model, state) {
            this._setState(this.model.get('enabled'), state);
        },

        _setState: function (enabled, playerState) {
            this.$el.toggleClass('disabled', !enabled);

            //  TODO: There's a difference between buffering and about to play and buffering and going to be paused afterward. How to tell the difference?
            //  TODO: jQuery doesn't support SVGs.
            this.ui.pauseIcon[0].classList.toggle('hidden', playerState !== PlayerState.Playing && playerState !== PlayerState.Buffering);
            this.ui.playIcon[0].classList.toggle('hidden', playerState === PlayerState.Playing || playerState === PlayerState.Buffering);
        }
    });

    return PlayPauseButtonView;
});