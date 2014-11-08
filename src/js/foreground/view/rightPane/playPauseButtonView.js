define([
    'common/enum/playerState',
    'text!template/rightPane/playPauseButton.html'
], function (PlayerState, PlayPauseButtonTemplate) {
    'use strict';

    var PlayPauseButtonView = Backbone.Marionette.ItemView.extend({
        tagName: 'button',
        id: 'playPauseButton',
        className: 'button--icon button--large',
        template: _.template(PlayPauseButtonTemplate),
        
        ui: {
            playIcon: '#rightPane-playIcon',
            pauseIcon: '#rightPane-pauseIcon'
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
            this.$el
                .toggleClass('disabled', !enabled)
                .toggleClass('is-showingSpinner', playerState === PlayerState.Buffering);
            
            this.ui.pauseIcon.toggleClass('hidden', playerState !== PlayerState.Playing);
            this.ui.playIcon.toggleClass('hidden', playerState === PlayerState.Buffering || playerState === PlayerState.Playing);
        }
    });

    return PlayPauseButtonView;
});