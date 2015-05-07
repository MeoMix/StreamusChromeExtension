define(function(require) {
    'use strict';

    var MediaSourceWrapper = require('foreground/model/mediaSourceWrapper');
    var PlayerState = require('common/enum/playerState');

    var VideoView = Marionette.ItemView.extend({
        tagName: 'video',
        className: 'video--youTube',
        template: false,

        mediaSourceWrapper: null,
        mediaSourceWrapperEvents: {
            'change:objectURL': '_onMediaSourceWrapperChangeObjectURL'
        },

        player: null,
        playerEvents: {
            'change:bufferType': '_onPlayerChangeBufferType',
            'change:state': '_onPlayerChangeState',
            'receive:currentTimeHighPrecision': '_onPlayerReceiveCurrentTimeHighPrecision'
        },

        initialize: function() {
            this.mediaSourceWrapper = new MediaSourceWrapper();
            this.player = Streamus.backgroundPage.player;

            this.bindEntityEvents(this.player, this.playerEvents);
            this.bindEntityEvents(this.mediaSourceWrapper, this.mediaSourceWrapperEvents);

            //  Bind pre-emptively to preserve the function reference. Allows for calling removeEventListener if needed.
            this._onWindowUnload = this._onWindowUnload.bind(this);
            window.addEventListener('unload', this._onWindowUnload);

            this._ensureInitialState(this.player.get('state'), this.player.get('bufferType'));
        },

        onBeforeDestroy: function() {
            window.removeEventListener('unload', this._onWindowUnload);
            this.mediaSourceWrapper.cleanup();
        },

        _onPlayerChangeState: function(player, state) {
            this._syncPlayingState(state);
        },

        _onPlayerReceiveCurrentTimeHighPrecision: function(player, message) {
            this._setCurrentTime(player.get('state'), message.currentTimeHighPrecision, message.timestamp);
        },

        _onMediaSourceWrapperChangeObjectURL: function(mediaSourceWrapper, objectURL) {
            this._setVideoSrc(objectURL);
        },

        _onPlayerChangeBufferType: function(player, bufferType) {
            this.mediaSourceWrapper.set('bufferType', bufferType);
        },

        _onWindowUnload: function() {
            this.stopListening();
        },

        //  Whenever a video is created its time/state might not be synced with an existing video.
        _ensureInitialState: function(playerState, playerBufferType) {
            this.mediaSourceWrapper.set('bufferType', playerBufferType);
            this._requestCurrentTimeUpdate();
            this._syncPlayingState(playerState);
        },

        _setVideoSrc: function(objectURL) {
            var videoSrc = objectURL === null ? '' : objectURL;
            this.el.src = videoSrc;
        },

        _play: function() {
            //  It's important to call syncCurrentTime when beginning playback because there's a slight delay between
            //  when the video in the background begins playback and the foreground video.
            this._requestCurrentTimeUpdate();
            this.el.play();
        },

        _pause: function() {
            this.el.pause();
        },

        _requestCurrentTimeUpdate: function() {
            //  It's important to specifically ask the player for the currentTime because this will give 100% accurate result.
            //  Otherwise, can only get within ~200ms by responding to the 'timeupdate' event of the other video. 
            this.player.requestCurrentTimeHighPrecision();
        },

        _setCurrentTime: function(playerState, currentTimeHighPrecision, timestamp) {
            //  If the player is playing then currentTimeHighPrecision will be slightly out-of-sync due to the time it takes to request
            //  the information. So, subtract an offset of the time it took to receive the message.
            if (playerState === PlayerState.Playing) {
                var offset = Date.now() - timestamp;
                currentTimeHighPrecision -= offset * 0.001;
            }

            this.el.currentTime = currentTimeHighPrecision;
        },

        _syncPlayingState: function(playerState) {
            if (playerState === PlayerState.Playing) {
                this._play();
            } else {
                this._pause();
            }
        }
    });

    return VideoView;
});