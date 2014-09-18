//  This view is intended to house all of the player controls (play, pause, etc) as well as the StreamView
define([
    'common/enum/playerState',
    'foreground/view/rightBasePane/adminMenuAreaView',
    'foreground/view/rightBasePane/streamView',
    'foreground/view/rightBasePane/timeAreaView',
    'foreground/view/rightBasePane/volumeAreaView',
    'text!template/rightBasePane.html'
], function (PlayerState, AdminMenuAreaView, StreamView, TimeAreaView, VolumeAreaView, RightBasePaneTemplate) {
    'use strict';

    var StreamItems = Streamus.backgroundPage.StreamItems;
    var NextButton = Streamus.backgroundPage.NextButton;
    var PlayPauseButton = Streamus.backgroundPage.PlayPauseButton;
    var PreviousButton = Streamus.backgroundPage.PreviousButton;

    var RightBasePaneView = Backbone.Marionette.LayoutView.extend({
        id: 'rightBasePane',
        className: 'rightPane column flex-column',
        template: _.template(RightBasePaneTemplate),
        
        ui: {
            nextButton: '#rightBasePane-nextButton',
            previousButton: '#rightBasePane-previousButton',
            playPauseButton: '#rightBasePane-playPauseButton',
            playIcon: '#rightBasePane-playIcon',
            pauseIcon: '#rightBasePane-pauseIcon',
            contentRegion: '#rightBasePane-contentRegion',
            timeAreaRegion: '#rightBasePane-timeAreaRegion',
            volumeAreaRegion: '#rightBasePane-volumeAreaRegion',
            adminMenuAreaRegion: '#rightBasePane-adminMenuAreaRegion'
        },
        
        regions: {
            contentRegion: '@ui.contentRegion',
            timeAreaRegion: '@ui.timeAreaRegion',
            volumeAreaRegion: '@ui.volumeAreaRegion',
            adminMenuAreaRegion: '@ui.adminMenuAreaRegion'
        },
        
        events: {
            'click @ui.nextButton': '_tryActivateNextStreamItem',
            'click @ui.previousButton': '_tryDoTimeBasedPrevious',
            'click @ui.playPauseButton': '_tryTogglePlayerState'
        },
        
        modelEvents: {
            'change:state': '_setPlayPauseButtonState'
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
            this.timeAreaRegion.show(new TimeAreaView({
                model: this.model
            }));

            this.volumeAreaRegion.show(new VolumeAreaView({
                model: this.model
            }));

            this.adminMenuAreaRegion.show(new AdminMenuAreaView());
            
            //  IMPORTANT: This needs to be appended LAST because top content is flexible which will affect this element's height.
            this.contentRegion.show(new StreamView({
                collection: StreamItems
            }));
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
                .toggleClass('loading', playerState === PlayerState.Buffering);
            
            this.ui.pauseIcon.toggleClass('hidden', playerState !== PlayerState.Playing);
            this.ui.playIcon.toggleClass('hidden', playerState === PlayerState.Buffering || playerState === PlayerState.Playing);
        }
    });

    return RightBasePaneView;
});