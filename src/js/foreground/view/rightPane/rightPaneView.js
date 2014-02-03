//  This view is intended to house all of the player controls (play, pause, etc) as well as the StreamView
define([
    'foreground/view/genericForegroundView',
    'foreground/model/foregroundViewManager',
    'text!template/rightPane.html',
    'foreground/view/rightPane/stream/streamView',
    'foreground/view/rightPane/playPauseButtonView',
    'foreground/view/rightPane/previousButtonView',
    'foreground/view/rightPane/nextButtonView',
    'foreground/view/rightPane/volumeControlView',
    'foreground/view/rightPane/timeProgressAreaView',
    'foreground/view/rightPane/videoDisplayButtonView',
    'foreground/collection/streamItems'
], function (GenericForegroundView, ForegroundViewManager, RightPaneTemplate, StreamView, PlayPauseButtonView, PreviousButtonView, NextButtonView, VolumeControlView, TimeProgressAreaView, VideoDisplayButtonView, StreamItems) {
    'use strict';

    var RightPaneView = Backbone.Marionette.Layout.extend({

        className: 'right-pane',

        template: _.template(RightPaneTemplate),
        
        regions: {
            stream: {
                selector: '#stream'
            }
        },

        playPauseButtonView: null,
        previousButtonView: null,
        nextButtonView: null,
        volumeControlView: null,
        timeProgressAreaView: null,
        videoDisplayButtonView: null,

        onRender: function () {
            var topBar = this.$el.children('.top-bar');

            topBar.after(this.timeProgressAreaView.render().el);

            var topBarCenterGroup = topBar.children('.center-group');

            topBarCenterGroup.before(this.volumeControlView.render().el);

            topBarCenterGroup.append(this.previousButtonView.render().el);
            topBarCenterGroup.append(this.playPauseButtonView.render().el);
            topBarCenterGroup.append(this.nextButtonView.render().el);

            var topBarRightGroup = topBar.children('.right-group');
            topBarRightGroup.append(this.videoDisplayButtonView.render().el);

            this.stream.show(new StreamView({
                collection: StreamItems
            }));
            GenericForegroundView.prototype.initializeTooltips.call(this);
        },
        
        initialize: function() {

            this.playPauseButtonView = new PlayPauseButtonView();
            this.previousButtonView = new PreviousButtonView();
            this.nextButtonView = new NextButtonView();
            this.volumeControlView = new VolumeControlView();
            this.timeProgressAreaView = new TimeProgressAreaView();
            this.videoDisplayButtonView = new VideoDisplayButtonView();

            ForegroundViewManager.get('views').push(this);
        },

    });

    return RightPaneView;
});