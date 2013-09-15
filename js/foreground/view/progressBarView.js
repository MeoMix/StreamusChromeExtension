//  A progress bar which shows the elapsed time as compared to the total time of the current video.
define([
    'streamItems',
    'player',
    'utility',
    'playerState'
], function (StreamItems, Player, Utility, PlayerState) {
    'use strict';

    var ProgressBarView = Backbone.View.extend({

        el: $('#ProgressBarView'),
        
        currentTimeLabel: $('#CurrentTimeLabel'),
        
        totalTimeLabel: $('#TotalTimeLabel'),

        autoUpdate: true,
        
        events: {
            
            change: 'updateProgress',
            mousewheel: 'mousewheelUpdateProgress',
            mousedown: 'startSeeking',
            mouseup: 'seekToTime',
            
        },
        
        render: function () {
            
            if (this.autoUpdate) {

                //  If a video is currently playing when the GUI opens then initialize with those values.
                //  Set total time before current time because it affects the range's max.
                this.setTotalTime(this.getCurrentVideoDuration());
                this.setCurrentTime(Player.get('currentTime'));
                
            }

            return this;
        },
        
        initialize: function () {
            this.$el.attr('title', chrome.i18n.getMessage("clickDragChangeTime"));
            //  TODO: naming discrepancy
            this.currentTimeLabel.attr('title', chrome.i18n.getMessage("elapsedTime"));
            this.totalTimeLabel.attr('title', chrome.i18n.getMessage("totalTime"));
            
            this.listenTo(StreamItems, 'empty', this.clear);
            this.listenTo(StreamItems, 'change:selected', this.restart);
            this.listenTo(Player, 'change:currentTime', this.render);
            this.listenTo(Player, 'change:state', this.stopSeeking);

            this.render();
            this.updateProgress();
        },
        
        //  Repaints the progress bar's filled-in amount based on the % of time elapsed for current video.
        //  Keep separate from render because render is based on the player's values and updateProgress is based on the progress bar's values.
        //  This is an important distinction because when the user is dragging the progress bar -- the player won't be updating -- but progress bar
        //  values need to be re-rendered.
        updateProgress: function () {
            
            var currentTime = parseInt(this.$el.val(), 10);
            var totalTime = parseInt(this.$el.prop('max'), 10);

            //  Don't divide by 0.
            var fill = totalTime === 0 ? 0 : currentTime / totalTime;

            if (fill < 0 || fill > 1) throw "Wow this really should not have been " + fill;

            var backgroundImage = '-webkit-gradient(linear,left top, right top, from(#ccc), color-stop(' + fill + ',#ccc), color-stop(' + fill + ',rgba(0,0,0,0)), to(rgba(0,0,0,0)))';
            this.$el.css('background-image', backgroundImage);

            this.currentTimeLabel.text(Utility.prettyPrintTime(currentTime));
            this.totalTimeLabel.text(Utility.prettyPrintTime(totalTime));
 
        },
        
        //  Allow the user to manual time change by click or scroll.
        mousewheelUpdateProgress: function (event) {

            var delta = event.originalEvent.wheelDeltaY / 120;
            var currentTime = parseInt(this.$el.val(), 10);
            
            this.setCurrentTime(currentTime + delta);
            Player.seekTo(currentTime + delta);
            
        },
        
        startSeeking: function (event) {

            //  1 is primary mouse button, usually left
            if (event.which === 1) {
                this.autoUpdate = false;
            }
            
        },

        stopSeeking: function(){
            
            //  Seek is known to have finished when the player announces a state change that isn't buffering / unstarted.
            var state = Player.get('state');

            if (state == PlayerState.PLAYING || state == PlayerState.PAUSED) {
                this.autoUpdate = true;
            }

        },
        
        seekToTime: function (event) {

            //  1 is primary mouse button, usually left
            if (event.which === 1) {
                //  Bind to progressBar mouse-up to support dragging as well as clicking.
                //  I don't want to send a message until drag ends, so mouseup works nicely. 
                var currentTime = parseInt(this.$el.val(), 10);
                Player.seekTo(currentTime);
            }
            
        },
       
        clear: function() {
            this.setCurrentTime(0);
            this.setTotalTime(0);
        },
        
        restart: function () {
            //  Disable auto-updates here because there's a split second while changing videos that a timer tick makes things flicker weirdly.
            this.autoUpdate = false;

            this.setCurrentTime(0);
            this.setTotalTime(this.getCurrentVideoDuration());

            this.autoUpdate = true;
        },
        
        setCurrentTime: function (currentTime) {
            this.$el.val(currentTime);
            this.updateProgress();
        },
        
        setTotalTime: function(totalTime) {
            this.$el.prop('max', totalTime);
            this.updateProgress();
        },
        
        //  Return 0 or currently selected video's duration.
        getCurrentVideoDuration: function() {
            var duration = 0;

            if (StreamItems.length > 0) {
                var selectedStreamItem = StreamItems.findWhere({ selected: true });
                duration = selectedStreamItem.get('video').get('duration');
            }

            return duration;
        }
    });

    return new ProgressBarView;
});