//  This view is intended to house all of the player controls (play, pause, etc) as well as the StreamView
define([
    'common/enum/playerState',
    'foreground/view/rightBasePane/menuAreaView',
    'foreground/view/rightBasePane/streamView',
    'foreground/view/rightBasePane/timeProgressView',
    'foreground/view/rightBasePane/volumeView',
    'text!template/rightBasePane.html'
], function (PlayerState, MenuAreaView, StreamView, TimeProgressView, VolumeView, RightBasePaneTemplate) {
    'use strict';

    var StreamItems = Streamus.backgroundPage.StreamItems;
    var NextButton = Streamus.backgroundPage.NextButton;
    var PlayPauseButton = Streamus.backgroundPage.PlayPauseButton;
    var PreviousButton = Streamus.backgroundPage.PreviousButton;

    var RightBasePaneView = Backbone.Marionette.LayoutView.extend({
        id: 'right-base-pane',
        className: 'right-pane full flex-column',
        template: _.template(RightBasePaneTemplate),
        
        regions: {
            streamRegion: '.region.stream',
            timeProgressRegion: '.region.time-progress',
            volumeRegion: '.region.volume',
            streamusMenuRegion: '.region.streamus-menu'
        },
        
        events: {
            'click @ui.nextButton': '_tryActivateNextStreamItem',
            'click @ui.previousButton': '_tryDoTimeBasedPrevious',
            'click @ui.playPauseButton': '_tryTogglePlayerState'
        },
        
        modelEvents: {
            'change:state': '_setPlayPauseButtonState'
        },
        
        ui: {
            nextButton: '#next-button',
            previousButton: '#previous-button',
            playPauseButton: '#play-pause-button'
        },

        initialize: function () {
            this.listenTo(NextButton, 'change:enabled', this._setNextButtonDisabled);
            this.listenTo(PreviousButton, 'change:enabled', this._setPreviousButtonDisabled);
            this.listenTo(PlayPauseButton, 'change:enabled', this._setPlayPauseButtonState);
        },
        
        onRender: function () {
            this._setPlayPauseButtonState();
            this._setNextButtonDisabled();
            this._setPreviousButtonDisabled();
        },
        
        onShow: function () {
            this.streamRegion.show(new StreamView({
                collection: StreamItems
            }));

            this.timeProgressRegion.show(new TimeProgressView({
                model: this.model
            }));

            this.volumeRegion.show(new VolumeView({
                model: this.model
            }));

            //  TODO: Instead of MenuAreaView called it StreamusMenuAreaView for clarity.
            this.streamusMenuRegion.show(new MenuAreaView());
        },
        
        _tryActivateNextStreamItem: function () {
            //  Model is persistent to allow for easy rule validation when using keyboard shortcuts to control.
            NextButton.tryActivateNextStreamItem();
        },
        
        _tryDoTimeBasedPrevious: function() {
            PreviousButton.tryDoTimeBasedPrevious();
        },
        
        _tryTogglePlayerState: function () {
            PlayPauseButton.tryTogglePlayerState();
        },
        
        _setNextButtonDisabled: function () {
            this.ui.nextButton.toggleClass('disabled', !NextButton.get('enabled'));
        },
        
        _setPreviousButtonDisabled: function() {
            this.ui.previousButton.toggleClass('disabled', !PreviousButton.get('enabled'));
        },

        _setPlayPauseButtonState: function() {
            var playerState = this.model.get('state');

            //  TODO: Break this apart into more discernable functions.
            this.ui.playPauseButton
                .toggleClass('disabled', !PlayPauseButton.get('enabled'))
                .toggleClass('loading', playerState === PlayerState.Buffering)
                .toggleClass('playing', playerState === PlayerState.Playing)
                .toggleClass('paused', playerState !== PlayerState.Buffering && playerState !== PlayerState.Playing);
        }
    });

    return RightBasePaneView;
});