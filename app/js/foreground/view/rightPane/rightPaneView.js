//  This view is intended to house all of the player controls (play, pause, etc) as well as the StreamView
define([
   'foreground/view/genericForegroundView',
    'text!template/rightPane.htm',
    'foreground/view/rightPane/stream/streamView',
    'foreground/view/rightPane/playPauseButtonView',
    'foreground/view/rightPane/previousButtonView',
    'foreground/view/rightPane/nextButtonView',
    'foreground/view/rightPane/volumeControlView',
    'foreground/view/rightPane/timeProgressAreaView',
    'foreground/view/rightPane/videoDisplayButtonView'
], function (GenericForegroundView, RightPaneTemplate, StreamView, PlayPauseButtonView, PreviousButtonView, NextButtonView, VolumeControlView, TimeProgressAreaView, VideoDisplayButtonView) {
    'use strict';

    var RightPaneView = GenericForegroundView.extend({

        className: 'right-pane',

        template: _.template(RightPaneTemplate),

        streamView: new StreamView(),
        playPauseButtonView: new PlayPauseButtonView(),
        previousButtonView: new PreviousButtonView(),
        nextButtonView: new NextButtonView(),
        volumeControlView: new VolumeControlView(),
        timeProgressAreaView: new TimeProgressAreaView(),
        videoDisplayButtonView: new VideoDisplayButtonView(),

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
        }

    });

    return RightPaneView;
});