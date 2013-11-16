//  This view is intended to house all of the player controls (play, pause, etc) as well as the StreamView
define([
    'text!../template/rightPane.htm',
    'streamView',
    'playPauseButtonView',
    'previousButtonView',
    'nextButtonView',
    'volumeControlView',
    'timeProgressAreaView',
    'videoDisplayButtonView'
], function(RightPaneTemplate, StreamView, PlayPauseButtonView, PreviousButtonView, NextButtonView, VolumeControlView, TimeProgressAreaView, VideoDisplayButtonView) {
    'use strict';

    var RightPaneView = Backbone.View.extend({
        
        className: 'right-pane',

        template: _.template(RightPaneTemplate),
        
        streamView: null,
        playPauseButtonView: null,
        previousButtonView: null,
        nextButtonView: null,
        volumeControlView: null,
        timeProgressAreaView: null,
        videoDisplayButtonView: null,
        activeFolder: null,
        
        render: function() {
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
            
            this.$el.find('[title]:enabled').qtip({
                position: {
                    viewport: $(window)
                },
                style: {
                    classes: 'qtip-light qtip-shadow'
                }
            });

            return this;
        },
        
        initialize: function (options) {

            if (options.activeFolder == null) throw "RightPaneView expects to be initialized with an activeFolder";

            this.activeFolder = options.activeFolder;
            
            this.streamView = new StreamView({
                model: options.activeFolder
            });
            
            //  TODO: mmm... wat? I know the models are hosted on the background page, but there's gotta be a better way to do this.
            this.previousButtonView = new PreviousButtonView({
                model: chrome.extension.getBackgroundPage().PreviousButton
            });
            
            this.playPauseButtonView = new PlayPauseButtonView({
                model: chrome.extension.getBackgroundPage().PlayPauseButton
            });
            
            this.nextButtonView = new NextButtonView({
                model: chrome.extension.getBackgroundPage().NextButton
            });

            this.videoDisplayButtonView = new VideoDisplayButtonView({
                model: chrome.extension.getBackgroundPage().VideoDisplayButton
            });

            this.volumeControlView = new VolumeControlView();
            this.timeProgressAreaView = new TimeProgressAreaView();

        }

    });

    return RightPaneView;
})