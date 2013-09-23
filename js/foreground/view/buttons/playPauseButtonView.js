//  The play/pause icon.
define([
    'player',
    'playerState',
    'loadingSpinnerView'
], function (Player, PlayerState, LoadingSpinnerView) {
    'use strict';
    
    var PlayPauseButtonView = Backbone.View.extend({
        
        className: 'disabled playPauseButton',
        
        template: _.template($('#playPauseButtonTemplate').html()),
        
        events: {
            'click': 'tryTogglePlayerState'
        },
        
        loadingSpinnerView: new LoadingSpinnerView,
        
        disabledTitle: chrome.i18n.getMessage("playDisabled"),
        pauseTitle: chrome.i18n.getMessage("clickToPause"),
        playTitle: chrome.i18n.getMessage("clickToPlay"),
        
        render: function () {
            
            this.$el.html(this.template(_.extend(this.model.toJSON(), {
                //  mixin to be able to use it in templating
                'PlayerState': PlayerState,
                'playerState': Player.get('state')
            })));

            this.$el.toggleClass('disabled', !this.model.get('enabled'));
            
            //  Update which icon is showing whenever the YouTube player changes playing state.
            var playerState = Player.get('state');

            if (playerState === PlayerState.BUFFERING) {
                this.$el.append(this.loadingSpinnerView.render().el);
            } else {
                // Not buffering, so hide the spinner.
                this.loadingSpinnerView.remove();

                if (playerState === PlayerState.PLAYING) {
                    this.$el.attr('title', this.pauseTitle);
                } else {
                    this.$el.attr('title', this.playTitle);
                }
            }
            
            if (!this.model.get('enabled')) {
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