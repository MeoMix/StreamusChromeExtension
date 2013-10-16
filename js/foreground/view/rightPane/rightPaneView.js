//  This view is intended to house all of the player controls (play, pause, etc) as well as the StreamView
define([
    'text!../template/rightPane.htm',
    'streamView',
    'playPauseButtonView',
    'previousButtonView',
    'nextButtonView',
    'volumeControlView',
    'timeProgressAreaView',
    'streamItems'
], function(RightPaneTemplate, StreamView, PlayPauseButtonView, PreviousButtonView, NextButtonView, VolumeControlView, TimeProgressAreaView, StreamItems) {
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
        toggleVideoDisplayButton: null,
        activeFolder: null,
        
        events: {
            'click button#toggleVideoDisplay': 'toggleVideoDisplay'
        },
        
        render: function() {
            this.$el.html(this.template());

            var topBar = this.$el.children('.top-bar');

            topBar.after(this.timeProgressAreaView.render().el);
            
            var topBarCenterGroup = topBar.children('.center-group');

            topBarCenterGroup.before(this.volumeControlView.render().el);

            topBarCenterGroup.append(this.previousButtonView.render().el);
            topBarCenterGroup.append(this.playPauseButtonView.render().el);
            topBarCenterGroup.append(this.nextButtonView.render().el);

            this.$el.append(this.streamView.render().el);

            return this;
        },
        
        initialize: function (options) {

            console.log("Initializing right pane view.");

            if (options.activeFolder == null) throw "RightPaneView expects to be initialized with an activeFolder";

            this.activeFolder = options.activeFolder;
            
            this.streamView = new StreamView({
                model: options.activeFolder
            });
            
            console.log("Radio Button:", chrome.extension.getBackgroundPage().RadioButton);
            
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

            //  TODO: Maybe pass Player in as a model here?
            this.volumeControlView = new VolumeControlView();
            this.timeProgressAreaView = new TimeProgressAreaView();

        },

        toggleVideoDisplay: function (event) {
            $(event.currentTarget).toggleClass('enabled');
        }

    });

    return RightPaneView;
})