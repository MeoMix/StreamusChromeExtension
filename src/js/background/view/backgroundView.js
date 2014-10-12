//  Background.js is a bit of a dumping ground for code which needs a permanent housing spot.
define([
    'background/view/youTubePlayerRegion',
    'background/view/clipboardView',
    'background/model/player',
    'background/model/utility',
    'common/enum/playerState',
    //  TODO: How should I instantiate these more gracefully? Should I offload some of them to application? Maybe not?
    'background/model/browserSettings',
    'background/model/contextMenus',
    'background/model/clientErrorManager',
    'background/model/iconManager',
    'background/model/omnibox',
    'background/model/search',
    'background/model/settings',
    'background/model/syncManager',
    'background/model/tabManager',
    'background/model/user',
    'background/model/buttons/nextButton',
    'background/model/buttons/playPauseButton',
    'background/model/buttons/previousButton',
    'background/model/buttons/radioButton',
    'background/model/buttons/repeatButton',
    'background/model/buttons/shuffleButton'
], function (YouTubePlayerRegion, ClipboardView, Player, Utility, PlayerState) {
    'use strict';

    var BackgroundView = Backbone.Marionette.LayoutView.extend({
        el: $('body'),
        
        regions: {
            youTubePlayerRegion: YouTubePlayerRegion,
            clipboardRegion: '#clipboardRegion'
        },
        
        //  Suffix alarm with unique identifier to prevent running after browser closed & re-opened.
        //  http://stackoverflow.com/questions/14101569/chrome-extension-alarms-go-off-when-chrome-is-reopened-after-time-runs-out
        reloadAlarmName: 'reloadAlarm' + _.now(),
        needReloadYouTubePlayer: false,

        initialize: function () {
            this._showClipboardView();

            //  TODO: I would like to reconsider my implementation. It's possible for someone to juggle a single song between playing/not playing for long enough that
            //  it would still expire. It would be better to keep the timer always going as long as the song is loaded and if it pauses with the timer exceeded
            //  or is paused when the timer exceeds, reload.
            this.listenTo(Player, 'change:state', this._onPlayerChangeState);
            this.listenTo(Player, 'change:ready', this._onPlayerChangeReady);
            this.listenTo(Backbone.Wreqr.radio.channel('foreground').vent, 'unload', this._onForegroundUnload);
            chrome.alarms.onAlarm.addListener(this._onChromeAlarm.bind(this));
        },
        
        _showClipboardView: function() {
            var clipboardView = new ClipboardView();
            this.clipboardRegion.show(clipboardView);
        },
        
        _onChromeAlarm: function (alarm) {
            //  Check the alarm name because closing the browser will not clear an alarm, but new alarm name is generated on open.
            if (alarm.name === this.reloadAlarmName) {
                //  TODO: This method checks open tabs as well, but I think I need to check to see if the tab is focused -- otherwise it's OK to reload it.
                //  TODO: I need to be able to tell when Streamus as a tab has lost focus which is non-trivial.
                var foreground = chrome.extension.getViews({ type: "popup" });
                
                if (foreground.length > 0) {
                    this.needReloadYouTubePlayer = true;
                } else {
                    this._reloadYouTubePlayer();
                }

                //Utility.isForegroundActive(function (foregroundActive) {
                //    //  If the foreground is currently active -- delay reloading until it closes since it can negatively impact user experience.
                //    if (foregroundActive) {
                //        this.needReloadYouTubePlayer = true;
                //    } else {
                //        this._reloadYouTubePlayer();
                //    }
                //});
            }
        },
        
        _onPlayerChangeState: function (model, state) {
            if (state === PlayerState.Playing || state === PlayerState.Buffering) {
                this._clearReloadAlarm();
            } else {
                this._createReloadAlarm();
            }
        },
        
        _onPlayerChangeReady: function (model, ready) {
            if (!ready) {
                this._clearReloadAlarm();
            }
        },
        
        _clearReloadAlarm: function () {
            if (this.reloadAlarmCreated) {
                this.reloadAlarmCreated = false;
                chrome.alarms.clear(this.reloadAlarmName);
            }
        },
        
        _createReloadAlarm: function () {
            if (!this.reloadAlarmCreated) {
                this.reloadAlarmCreated = true;
                chrome.alarms.create(this.reloadAlarmName, {
                    //  Wait 6 hours
                    delayInMinutes: 360.0
                });
            }
        },
        
        _reloadYouTubePlayer: function() {
            this._clearReloadAlarm();
            Player.refresh();
        },
        
        _onForegroundUnload: function() {
            if (this.needReloadYouTubePlayer) {
                this.needReloadYouTubePlayer = false;
                this._reloadYouTubePlayer();
            }
        }
    });

    return BackgroundView;
});