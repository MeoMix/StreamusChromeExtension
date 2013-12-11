define([
    'genericForegroundView',
    'player',
    'playerState',
    'text!../template/playPauseButton.htm'
], function (GenericForegroundView, Player, PlayerState, PlayPauseButtonTemplate) {
    'use strict';
    
    var PlayPauseButtonView = GenericForegroundView.extend({
        
        tagName: 'button',

        className: 'button-icon',
        
        template: _.template(PlayPauseButtonTemplate),
        
        events: {
            'click': 'tryTogglePlayerState'
        },
        
        disabledTitle: chrome.i18n.getMessage('playDisabled'),
        pauseTitle: chrome.i18n.getMessage('clickToPause'),
        playTitle: chrome.i18n.getMessage('clickToPlay'),
        
        render: function () {
            
            this.$el.html(this.template(_.extend(this.model.toJSON(), {
                'PlayerState': PlayerState,
                'playerState': Player.get('state')
            })));

            var isEnabled = this.model.get('enabled');

            this.$el.toggleClass('disabled', !isEnabled);

            //  Update which icon is showing whenever the YouTube player changes playing state.
            if (isEnabled) {
                
                var playerState = Player.get('state');

                if (playerState === PlayerState.PLAYING) {
                    this.$el.attr('title', this.pauseTitle);
                } else {
                    this.$el.attr('title', this.playTitle);
                }
                
            } else {
                this.$el.attr('title', this.disabledTitle);
            }

            return this;
        },
        
        initialize: function () {

            this.listenTo(this.model, 'change:enabled', this.render);
            this.listenTo(Player, 'change:state', this.render);

            this.render();
        },
        
        tryTogglePlayerState: function() {
            this.model.tryTogglePlayerState();
        }
    });

    return PlayPauseButtonView;
});