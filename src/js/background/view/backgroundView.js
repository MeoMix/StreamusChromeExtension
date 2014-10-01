//  Background.js is a bit of a dumping ground for code which needs a permanent housing spot.
define([
    'background/view/youTubePlayerView',
    'background/view/clipboardView',
    'background/model/player',
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
], function (YouTubePlayerView, ClipboardView, Player, PlayerState) {
    'use strict';

    var BackgroundView = Backbone.Marionette.LayoutView.extend({
        el: $('body'),
        
        regions: {
            youTubePlayerRegion: '#youTubePlayerRegion',
            clipboardRegion: '#clipboardRegion'
        },
        
        //  Suffix alarm with unique identifier to prevent running after browser closed & re-opened.
        //  http://stackoverflow.com/questions/14101569/chrome-extension-alarms-go-off-when-chrome-is-reopened-after-time-runs-out
        reloadAlarmName: 'reloadAlarm' + _.now(),

        initialize: function () {
            this._showYouTubePlayerView();
            this._showClipboardView();

            this.listenTo(Player, 'change:state', this._onChangePlayerState);
            chrome.alarms.onAlarm.addListener(this._onChromeAlarm.bind(this));
        },
        
        _onChromeAlarm: function(alarm) {
            if (alarm.name === this.reloadAlarmName) {
                this._showYouTubePlayerView();
            }
        },
        
        _onChangePlayerState: function (model, state) {
            if (state === PlayerState.Playing || state === PlayerState.Buffering) {
                this._clearReloadAlarm();
            } else {
                this._createReloadAlarm();
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
                    //  Wait an hour
                    delayInMinutes: 60.0
                });
            }
        },

        _showYouTubePlayerView: function() {
            var youTubePlayerView = new YouTubePlayerView();
            this.youTubePlayerRegion.show(youTubePlayerView);
        },
        
        _showClipboardView: function() {
            var clipboardView = new ClipboardView();
            this.clipboardRegion.show(clipboardView);
        }
    });

    return new BackgroundView();
});