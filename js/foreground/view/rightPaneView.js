//  This view is intended to house all of the player controls (play, pause, etc) as well as the StreamView
define([
    'text!../template/rightPane.htm',
    'streamView',
    'repeatButtonView',
    'shuffleButtonView',
    'radioButtonView',
    'playPauseButtonView',
    'previousButtonView',
    'nextButtonView',
    'volumeControlView',
    'timeProgressAreaView'
], function(RightPaneTemplate, StreamView, RepeatButtonView, ShuffleButtonView, RadioButtonView, PlayPauseButtonView, PreviousButtonView, NextButtonView, VolumeControlView, TimeProgressAreaView) {
    'use strict';

    var RightPaneView = Backbone.View.extend({
        
        className: 'right-pane',

        template: _.template(RightPaneTemplate),
        
        streamView: null,
        radioButtonView: null,
        shuffleButtonView: null,
        repeatButtonView: null,
        playPauseButtonView: null,
        previousButtonView: null,
        nextButtonView: null,
        volumeControlView: null,
        timeProgressAreaView: null,
        
        render: function() {
            this.$el.html(this.template());

            var topBar = this.$el.children('.top-bar');

            topBar.after(this.timeProgressAreaView.render().el);
            
            var topBarCenterGroup = topBar.children('.center-group');

            topBarCenterGroup.before(this.volumeControlView.render().el);

            topBarCenterGroup.append(this.previousButtonView.render().el);
            topBarCenterGroup.append(this.playPauseButtonView.render().el);
            topBarCenterGroup.append(this.nextButtonView.render().el);

            this.$el.find('.progress-details').after(this.streamView.render().el);

            var leftGroupContextButtons = this.$el.find('.context-buttons .left-group');

            leftGroupContextButtons.append(this.shuffleButtonView.render().el);
            leftGroupContextButtons.append(this.repeatButtonView.render().el);
            leftGroupContextButtons.append(this.radioButtonView.render().el);
            
            return this;
        },
        
        initialize: function (options) {

            if (options.activeFolder == null) throw "RightPaneView expects to be initialized with an activeFolder";
            
            this.streamView = new StreamView({
                model: options.activeFolder
            });
            
            //  TODO: mmm... wat? I know the models are hosted on the background page, but there's gotta be a better way to do this.
            this.radioButtonView = new RadioButtonView({
                model: chrome.extension.getBackgroundPage().RadioButton
            });
            
            this.repeatButtonView = new RepeatButtonView({
                model: chrome.extension.getBackgroundPage().RepeatButton
            });

            this.shuffleButtonView = new ShuffleButtonView({
                model: chrome.extension.getBackgroundPage().ShuffleButton
            });
            
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

        }

    });

    return RightPaneView;
})