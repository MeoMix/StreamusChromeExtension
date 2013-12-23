//  A progress bar which shows the elapsed time as compared to the total time of the current video.
define([
    'foreground/view/genericForegroundView',
    'text!template/timeProgressArea.html',
    'foreground/collection/streamItems',
    'foreground/model/player',
    'utility',
    'enum/playerState',
    'foreground/model/settings'
], function (GenericForegroundView, TimeProgressAreaTemplate, StreamItems, Player, Utility, PlayerState, Settings) {
    'use strict';

    var TimeProgressAreaView = GenericForegroundView.extend({
            
        template: _.template(TimeProgressAreaTemplate),
        
        events: {
            'change input.timeRange:not(.disabled)': 'updateProgress',
            'mousewheel input.timeRange:not(.disabled)': 'mousewheelUpdateProgress',
            'mousedown input.timeRange:not(.disabled)': 'startSeeking',
            'mouseup input.timeRange:not(.disabled)': 'seekToTime',
            'click .time-elapsed': 'toggleShowTimeRemaining'
        },
        
        progress: null,
        timeRange: null,
        timeElapsedLabel: null,
        durationLabel: null,
        
        autoUpdate: true,

        render: function () {

            this.$el.html(this.template({
                'chrome.i18n': chrome.i18n
            }));

            //  Store references to child elements after rendering for ease of use.
            //  Progress is the shading filler for the volumeRange's value.
            this.progress = this.$el.find('.time-slider .progress');
            this.timeRange = this.$el.find('.time-slider input.timeRange');
            this.timeElapsedLabel = this.$el.find('.time-elapsed');
            this.durationLabel = this.$el.find('.duration');
            
            if (StreamItems.length === 0) {
                this.timeRange.toggleClass('disabled', true);
            }
                
            //  If a video is currently playing when the GUI opens then initialize with those values.
            //  Set total time before current time because it affects the range's max.
            this.setTotalTime(this.getCurrentVideoDuration());
            this.setCurrentTime(Player.get('currentTime'));
            
            return this;
        },
        
        initialize: function () {

            this.listenTo(StreamItems, 'empty', this.clear);
            this.listenTo(StreamItems, 'add addMultiple', this.enable);
            this.listenTo(StreamItems, 'change:selected', this.restart);
            this.listenTo(Player, 'change:currentTime', this.updateCurrentTime);
            this.listenTo(Player, 'change:state', this.stopSeeking);
        },
        
        //  Allow the user to manual time change by click or scroll.
        mousewheelUpdateProgress: function (event) {

            var delta = event.originalEvent.wheelDeltaY / 120;
            var currentTime = parseInt(this.timeRange.val());

            this.setCurrentTime(currentTime + delta);

            Player.seekTo(currentTime + delta);
        },

        startSeeking: function (event) {

            //  1 is primary mouse button, usually left
            if (event.which === 1) {
                this.autoUpdate = false;
            }

        },
        
        stopSeeking: function () {

            //  Seek is known to have finished when the player announces a state change that isn't buffering / unstarted.
            var state = Player.get('state');

            if (state == PlayerState.Playing || state == PlayerState.Paused) {
                this.autoUpdate = true;
            }

        },

        seekToTime: function (event) {

            //  1 is primary mouse button, usually left
            if (event.which === 1) {
                //  Bind to progressBar mouse-up to support dragging as well as clicking.
                //  I don't want to send a message until drag ends, so mouseup works nicely. 
                var currentTime = parseInt(this.timeRange.val());
                Player.seekTo(currentTime);
            }

        },
        
        toggleShowTimeRemaining: function() {

            var showTimeRemaining = Settings.get('showTimeRemaining');
            //  Toggle showTimeRemaining and then read the new state and apply it.
            Settings.set('showTimeRemaining', !showTimeRemaining);

            if (!showTimeRemaining) {
                this.timeElapsedLabel.attr('title', chrome.i18n.getMessage('timeRemaining'));
            } else {
                this.timeElapsedLabel.attr('title', chrome.i18n.getMessage('elapsedTime'));
            }

            this.timeElapsedLabel.toggleClass('timeRemaining', !showTimeRemaining);
            this.updateProgress();
        },
        
        enable: function () {
            this.timeRange.toggleClass('disabled', false);
        },
        
        clear: function () {

            this.setCurrentTime(0);
            this.setTotalTime(0);
            this.timeRange.toggleClass('disabled', true);
        },
        
        restart: function () {
            //  Disable auto-updates here because there's a split second while changing videos that a timer tick makes things flicker weirdly.
            this.autoUpdate = false;

            this.setCurrentTime(0);
            this.setTotalTime(this.getCurrentVideoDuration());

            this.autoUpdate = true;
        },
        
        setCurrentTime: function (currentTime) {
            this.timeRange.val(currentTime);
            this.updateProgress();
        },

        setTotalTime: function (totalTime) {
            this.timeRange.prop('max', totalTime);
            this.updateProgress();
        },
        
        updateCurrentTime: function () {

            if (this.autoUpdate) {
                this.setCurrentTime(Player.get('currentTime'));
            }
            
        },

        //  Repaints the progress bar's filled-in amount based on the % of time elapsed for current video.
        //  Keep separate from render because render is based on the player's values and updateProgress is based on the progress bar's values.
        //  This is an important distinction because when the user is dragging the progress bar -- the player won't be updating -- but progress bar
        //  values need to be re-rendered.
        updateProgress: function () {

            var currentTime = parseInt(this.timeRange.val());
            var totalTime = parseInt(this.timeRange.prop('max'));

            //  Don't divide by 0.
            var progressPercent = totalTime === 0 ? 0 : currentTime * 100 / totalTime;

            if (progressPercent < 0 || progressPercent > 100) throw "Wow this really should not have been " + progressPercent;

            this.progress.width(progressPercent + '%');
            
            if (Settings.get('showTimeRemaining')) {
                
                //  Calculate the time remaining from the current time and show that instead.
                var timeRemaining = totalTime - currentTime;

                this.timeElapsedLabel.text(Utility.prettyPrintTime(timeRemaining));
            } else {
                this.timeElapsedLabel.text(Utility.prettyPrintTime(currentTime));
            }

            this.durationLabel.text(Utility.prettyPrintTime(totalTime));
 
        },

        //  Return 0 or currently selected video's duration.
        getCurrentVideoDuration: function () {
            var duration = 0;

            if (StreamItems.length > 0) {
                var selectedStreamItem = StreamItems.getSelectedItem();
                duration = selectedStreamItem.get('video').get('duration');
            }

            return duration;
        }
        

    });

    return TimeProgressAreaView;
});