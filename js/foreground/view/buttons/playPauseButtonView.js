//  The play/pause icon.
define([
    'player',
    'playerState',
    'streamItems',
    'loadingSpinnerView'
], function (Player, PlayerState, StreamItems, LoadingSpinnerView) {
    'use strict';
    
    var PlayPauseButtonView = Backbone.View.extend({
        el: $('#PlayPauseButton'),
        
        events: {
            'click': 'togglePlayingState'
        },
        
        loadingSpinnerView: new LoadingSpinnerView,
        
        disabledTitle: chrome.i18n.getMessage("playDisabled"),
        pauseTitle: chrome.i18n.getMessage("clickToPause"),
        playTitle: chrome.i18n.getMessage("clickToPlay"),
        
        render: function () {

            if (StreamItems.where({ selected: true }).length > 0) {
                this.enable();
            } else {
                this.disable();
            }

            var pauseIcon = $('#PauseIcon');
            var playIcon = $('#PlayIcon');
            
            //  Whenever the YouTube player changes playing state -- update whether icon shows play or pause.
            var playerState = Player.get('state');

            if (playerState === PlayerState.BUFFERING) {
                this.$el.append(this.loadingSpinnerView.render().el);

                playIcon.hide();
                pauseIcon.hide();
            } else {
                // Not buffering, so hide the spinner.
                this.loadingSpinnerView.remove();

                if (playerState === PlayerState.PLAYING) {
                    //  Change the music button to the 'Pause' image
                    pauseIcon.show();
                    playIcon.hide();
                    this.$el.attr('title', this.pauseTitle);
                } else {
                    //  Change the music button to the 'Play' image
                    pauseIcon.hide();
                    playIcon.show();
                    this.$el.attr('title', this.playTitle);
                }
            }

            return this;
        },
        
        initialize: function () {
            
            this.listenTo(StreamItems, 'change:selected empty remove', this.render);
            this.listenTo(Player, 'change:state', this.render);
            
            this.render();
        },
        
        //  Only allow changing once every 100ms to preent spamming.
        togglePlayingState: _.debounce(function () {

            if (!this.$el.hasClass('disabled')) {
                if (Player.isPlaying()) {
                    Player.pause();
                } else {
                    Player.play();
                }
            }

        }, 100, true),

        //  Paint button's path black and allow it to be clicked
        enable: function() {
            this.$el.removeClass('disabled');
            this.$el.attr('title', this.playTitle);
        },
        
        //  Paint the button's path gray and disallow it to be clicked
        disable: function() {
            this.$el.addClass('disabled');
            this.$el.attr('title', this.disabledTitle);
        },
    });

    return new PlayPauseButtonView;
});