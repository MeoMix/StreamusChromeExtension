//  This view is intended to house all of the player controls (play, pause, etc) as well as the StreamView
define([
    'foreground/view/genericForegroundView',
    'foreground/model/foregroundViewManager',
    'text!template/rightPane.html',
    'foreground/view/rightPane/streamView',
    'foreground/view/rightPane/volumeControlView',
    'foreground/view/rightPane/timeProgressView',
    'foreground/collection/streamItems',
    'foreground/model/player',
    'foreground/model/nextButton',
    'foreground/model/previousButton',
    'enum/playerState'
], function (GenericForegroundView, ForegroundViewManager, RightPaneTemplate, StreamView, VolumeControlView, TimeProgressView, StreamItems, Player, NextButton, PreviousButton, PlayerState) {
    'use strict';

    var RightPaneView = Backbone.Marionette.Layout.extend({

        className: 'right-pane',

        template: _.template(RightPaneTemplate),
        
        regions: {
            stream: '#stream',
            timeProgress: '#time-progress',
            volume: '#volume'
        },
        
        events: {
            'click @ui.nextButton': 'trySelectNextVideo',
            'click @ui.previousButton': 'tryDoTimeBasedPrevious',
            'click @ui.playPauseButton': 'tryTogglePlayerState'
        },
        
        ui: {
            nextButton: '#next-button',
            previousButton: '#previous-button',
            playPauseButton: '#play-pause-button'
        },

        onRender: function () {
            
            this.stream.show(new StreamView({
                collection: StreamItems
            }));

            this.timeProgress.show(new TimeProgressView({
                model: this.model
            }));
            
            this.volume.show(new VolumeControlView({
                model: this.model
            }));
            
            this.setPlayPauseButtonState();
            this.setNextButtonDisabled();
            this.setPreviousButtonDisabled();

            GenericForegroundView.prototype.initializeTooltips.call(this);
        },
        
        modelEvents: {
            'change:state': 'setPlayPauseButtonState'
        },
        
        initialize: function() {
            ForegroundViewManager.subscribe(this);

            this.listenTo(NextButton, 'change:enabled', this.setNextButtonDisabled);
            this.listenTo(PreviousButton, 'change:enabled', this.setPreviousButtonDisabled);
        },
        
        trySelectNextVideo: function () {
            //  Model is persistent to allow for easy rule validation when using keyboard shortcuts to control.
            NextButton.trySelectNextVideo();
        },
        
        tryDoTimeBasedPrevious: function() {
            PreviousButton.tryDoTimeBasedPrevious();
        },
        
        tryTogglePlayerState: function() {
            this.model.tryTogglePlayerState();
        },
        
        setNextButtonDisabled: function() {
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
            
            var isEnabled = this.model.get('enabled');
            this.ui.playPauseButton.toggleClass('disabled', !isEnabled);
        }

    });

    return RightPaneView;
});