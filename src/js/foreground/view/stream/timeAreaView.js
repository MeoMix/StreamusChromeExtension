define(function (require) {
    'use strict';

    var PlayerState = require('common/enum/playerState');
    var Utility = require('common/utility');
    var Tooltip = require('foreground/view/behavior/tooltip');
    var TimeAreaTemplate = require('text!template/stream/timeArea.html');

    var TimeAreaView = Marionette.ItemView.extend({
        id: 'timeArea',
        className: 'timeArea',
        template: _.template(TimeAreaTemplate),
        templateHelpers: function () {
            return {
                totalTimeMessage: chrome.i18n.getMessage('totalTime'),
                //  TODO: I don't want totalTime written to localStorage which means I exclude it from the JSON serialization, but I need it in my template..
                totalTime: this.model.get('totalTime'),
                prettyTotalTime: Utility.prettyPrintTime(this.model.get('totalTime'))
            };
        },
        
        ui: function () {
            return {
                timeProgress: '#' + this.id + '-timeProgress',
                timeRange: '#' + this.id + '-timeRange',
                elapsedTimeLabel: '#' + this.id + '-elapsedTimeLabel',
                totalTimeLabel: '#' + this.id + '-totalTimeLabel'
            };
        },

        events: {
            'input @ui.timeRange': '_onInputTimeRange',
            'wheel @ui.timeRange': '_onWheelTimeRange',
            'mousedown @ui.timeRange': '_onMouseDownTimeRange',
            'mouseup @ui.timeRange': '_onMouseUpTimeRange',
            'click @ui.elapsedTimeLabel': '_onClickElapsedTimeLabel'
        },

        behaviors: {
            Tooltip: {
                behaviorClass: Tooltip
            }
        },
        
        streamItems: null,
        player: null,
        
        initialize: function () {
            this.streamItems = Streamus.backgroundPage.stream.get('items');
            this.player = Streamus.backgroundPage.player;

            this.listenTo(this.player, 'change:currentTime', this._onPlayerChangeCurrentTime);
            this.listenTo(this.player, 'change:state', this._onPlayerChangeState);
        },

        onRender: function () {
            this._setCurrentTime(this.player.get('currentTime'));
            this._setElapsedTimeLabelTitle(this.model.get('showRemainingTime'));
        },
        
        _onInputTimeRange: function() {
            this._updateTimeProgress();
        },
        
        //  Allow the user to manual time change by click or scroll.
        _onWheelTimeRange: function (event) {
            var delta = event.originalEvent.wheelDeltaY / 120;
            var currentTime = parseInt(this.ui.timeRange.val());

            this._setCurrentTime(currentTime + delta);

            this.player.seekTo(currentTime + delta);
        },
        
        _onMouseDownTimeRange: function (event) {
            //  1 is primary mouse button, usually left
            if (event.which === 1) {
                this._startSeeking();
            }
        },
        //  TODO: This runs even if onMouseDownTimeRange did not run.
        _onMouseUpTimeRange: function (event) {
            //  1 is primary mouse button, usually left
            if (event.which === 1) {
                this._seekToCurrentTime();
            }
        },
        
        _onClickElapsedTimeLabel: function () {
            this._toggleShowRemainingTime();
        },
        
        _onPlayerChangeState: function () {
            this._stopSeeking();
        },
        
        _onPlayerChangeCurrentTime: function (model, currentTime) {
            this._updateCurrentTime(currentTime);
        },

        _startSeeking: function () {
            this.model.set('autoUpdate', false);
        },
        
        _stopSeeking: function () {
            //  Seek is known to have finished when the player announces a state change that isn't buffering / unstarted.
            var state = this.player.get('state');

            if (state === PlayerState.Playing || state === PlayerState.Paused || state === PlayerState.SongCued) {
                this.model.set('autoUpdate', true);
            }
        },

        _seekToCurrentTime: function () {
            //  Bind to progressBar mouse-up to support dragging as well as clicking.
            //  I don't want to send a message until drag ends, so mouseup works nicely. 
            var currentTime = parseInt(this.ui.timeRange.val());
            this.player.seekTo(currentTime);
        },
        
        _toggleShowRemainingTime: function() {
            var showRemainingTime = this.model.get('showRemainingTime');
            //  Toggle showRemainingTime and then read the new state and apply it.
            this.model.save('showRemainingTime', !showRemainingTime);

            this._setElapsedTimeLabelTitle(!showRemainingTime);

            this._updateTimeProgress();
        },
        
        _setElapsedTimeLabelTitle: function (showRemainingTime) {
            var title = showRemainingTime ? chrome.i18n.getMessage('remainingTime') : chrome.i18n.getMessage('elapsedTime');
            this.ui.elapsedTimeLabel.attr('title', title);
        },

        _setCurrentTime: function (currentTime) {
            this.ui.timeRange.val(currentTime);
            this._updateTimeProgress();
        },

        _updateCurrentTime: function (currentTime) {
            if (this.model.get('autoUpdate')) {
                this._setCurrentTime(currentTime);
            }
        },

        //  Repaints the progress bar's filled-in amount based on the % of time elapsed for current song.
        //  Keep separate from render because render is based on the player's values and updateProgress is based on the progress bar's values.
        //  This is an important distinction because when the user is dragging the progress bar -- the player won't be updating -- but progress bar
        //  values need to be re-rendered.
        _updateTimeProgress: function () {
            var currentTime = parseInt(this.ui.timeRange.val());
            var totalTime = parseInt(this.ui.timeRange.prop('max'));

            //  Don't divide by 0.
            var progressPercent = totalTime === 0 ? 0 : currentTime * 100 / totalTime;
            this.ui.timeProgress.width(progressPercent + '%');
            
            if (this.model.get('showRemainingTime')) {
                //  Calculate the remaining time from the current time and show that instead.
                var remainingTime = totalTime - currentTime;
                this.ui.elapsedTimeLabel.text(Utility.prettyPrintTime(remainingTime));
            } else {
                this.ui.elapsedTimeLabel.text(Utility.prettyPrintTime(currentTime));
            }
        }
    });

    return TimeAreaView;
});