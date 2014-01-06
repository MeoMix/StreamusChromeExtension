//  This view is intended to house all of the player controls (play, pause, etc) as well as the StreamView
define([
   'foreground/view/genericForegroundView',
    'text!template/rightPane.html',
    'foreground/view/rightPane/stream/streamView',
    'foreground/view/rightPane/playPauseButtonView',
    'foreground/view/rightPane/previousButtonView',
    'foreground/view/rightPane/nextButtonView',
    'foreground/view/rightPane/volumeControlView',
    'foreground/view/rightPane/timeProgressAreaView',
    'foreground/view/rightPane/videoDisplayButtonView',
    'foreground/collection/streamItems'
], function (GenericForegroundView, RightPaneTemplate, StreamView, PlayPauseButtonView, PreviousButtonView, NextButtonView, VolumeControlView, TimeProgressAreaView, VideoDisplayButtonView, StreamItems) {
    'use strict';

    var RightPaneView = GenericForegroundView.extend({

        className: 'right-pane',

        template: _.template(RightPaneTemplate),

        streamView: null,
        playPauseButtonView: null,
        previousButtonView: null,
        nextButtonView: null,
        volumeControlView: null,
        timeProgressAreaView: null,
        videoDisplayButtonView: null,

        render: function () {
            this.$el.html(this.template());

            var topBar = this.$el.children('.top-bar');

            topBar.after(this.timeProgressAreaView.render().el);

            var topBarCenterGroup = topBar.children('.center-group');

            topBarCenterGroup.before(this.volumeControlView.render().el);

            topBarCenterGroup.append(this.previousButtonView.render().el);
            topBarCenterGroup.append(this.playPauseButtonView.render().el);
            topBarCenterGroup.append(this.nextButtonView.render().el);

            var topBarRightGroup = topBar.children('.right-group');
            topBarRightGroup.append(this.videoDisplayButtonView.render().el);

            this.$el.append(this.streamView.render().el);
            this.initializeTooltips();

            return this;
        },
        
        initialize: function() {
            this.streamView = new StreamView();
            this.playPauseButtonView = new PlayPauseButtonView();
            this.previousButtonView = new PreviousButtonView();
            this.nextButtonView = new NextButtonView();
            this.volumeControlView = new VolumeControlView();
            this.timeProgressAreaView = new TimeProgressAreaView();
            this.videoDisplayButtonView = new VideoDisplayButtonView();
        },

    });

    return RightPaneView;
});