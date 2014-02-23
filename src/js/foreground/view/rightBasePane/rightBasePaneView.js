//  This view is intended to house all of the player controls (play, pause, etc) as well as the StreamView
define([
    'text!template/rightBasePane.html',
    'foreground/view/rightBasePane/streamView',
    'foreground/view/rightBasePane/volumeView',
    'foreground/view/rightBasePane/timeProgressView',
    'background/collection/streamItems',
    'background/model/player',
    'background/model/buttons/nextButton',
    'background/model/buttons/previousButton',
    'background/model/buttons/playPauseButton',
    'common/enum/playerState'
], function (RightBasePaneTemplate, StreamView, VolumeView, TimeProgressView, StreamItems, Player, NextButton, PreviousButton, PlayPauseButton, PlayerState) {
    'use strict';

    var RightBasePaneView = Backbone.Marionette.Layout.extend({

        className: 'right-base-pane',

        template: _.template(RightBasePaneTemplate),
        
        regions: {
            stream: '#stream-region',
            timeProgress: '#time-progress-region',
            volume: '#volume-region'
        },
        
        events: {
            'click @ui.nextButton': 'tryActivateNextVideo',
            'click @ui.previousButton': 'tryDoTimeBasedPrevious',
            'click @ui.playPauseButton': 'tryTogglePlayerState'
        },
        
        modelEvents: {
            'change:state': 'setPlayPauseButtonState'
        },
        
        ui: {
            nextButton: '#next-button',
            previousButton: '#previous-button',
            playPauseButton: '#play-pause-button'
        },
        
        onShow: function () {
            this.stream.show(new StreamView({
                collection: StreamItems
            }));

            this.timeProgress.show(new TimeProgressView({
                model: this.model
            }));

            this.volume.show(new VolumeView({
                model: this.model
            }));
        },

        onRender: function () {
            this.setPlayPauseButtonState();
            this.setNextButtonDisabled();
            this.setPreviousButtonDisabled();

            this.applyTooltips();
        },
        
        //  TODO: Why do I have to do this manually? I thought Marionette handled this for me?
        onClose: function () {
            this.stopListening(NextButton);
            this.stopListening(PreviousButton);
            this.stopListening(PlayPauseButton);
            this.stopListening(this.model);
        },

        initialize: function () {
            this.listenTo(NextButton, 'change:enabled', this.setNextButtonDisabled);
            this.listenTo(PreviousButton, 'change:enabled', this.setPreviousButtonDisabled);
            this.listenTo(PlayPauseButton, 'change:enabled', this.setPlayPauseButtonState);
        },
        
        tryActivateNextVideo: function () {
            //  Model is persistent to allow for easy rule validation when using keyboard shortcuts to control.
            NextButton.tryActivateNextVideo();
        },
        
        tryDoTimeBasedPrevious: function() {
            PreviousButton.tryDoTimeBasedPrevious();
        },
        
        tryTogglePlayerState: function () {
            PlayPauseButton.tryTogglePlayerState();
        },
        
        setNextButtonDisabled: function () {
            console.log('setNextButtonDisabled:', this.ui.nextButton, NextButton);
            this.ui.nextButton.toggleClass('disabled', !NextButton.get('enabled'));
        },
        
        setPreviousButtonDisabled: function() {
            this.ui.previousButton.toggleClass('disabled', !PreviousButton.get('enabled'));
        },
        
        setPlayPauseButtonState: function() {
            var playerState = this.model.get('state');
            
            var icon;
            switch(playerState) {
                case PlayerState.Buffering:
                    icon = $('<div>', { 'class': 'spinner spinner-small' });
                    break;
                case PlayerState.Playing:
                    icon = $('<i>', { 'class': 'fa fa-lg fa-pause' });
                    break;
                default:
                    icon = $('<i>', { 'class': 'fa fa-lg fa-play' });
            }

            this.ui.playPauseButton.empty().append(icon);
            this.ui.playPauseButton.toggleClass('disabled', !PlayPauseButton.get('enabled'));
        }

    });

    return RightBasePaneView;
});