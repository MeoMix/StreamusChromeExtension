define([
    'foreground/view/genericForegroundView',
    'foreground/model/player',
    'enum/playerState',
    'text!template/playPauseButton.html'
], function (GenericForegroundView, Player, PlayerState, PlayPauseButtonTemplate) {
    'use strict';
    
    var PlayPauseButtonView = GenericForegroundView.extend({
        
        tagName: 'button',

        className: 'button-icon',
        
        template: _.template(PlayPauseButtonTemplate),
        
        //  Model is persistent to allow for easy rule validation when using keyboard shortcuts to control.
        model: chrome.extension.getBackgroundPage().PlayPauseButton,
        
        events: {
            'click': 'tryTogglePlayerState'
        },
        
        disabledTitle: chrome.i18n.getMessage('playDisabled'),
        pauseTitle: chrome.i18n.getMessage('pause'),
        playTitle: chrome.i18n.getMessage('play'),
        
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

                if (playerState === PlayerState.Playing) {
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