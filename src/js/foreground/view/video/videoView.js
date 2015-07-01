define(function(require) {
  'use strict';

  var MediaSourceWrapper = require('foreground/model/video/mediaSourceWrapper');
  var PlayerState = require('common/enum/playerState');

  var VideoView = Marionette.ItemView.extend({
    tagName: 'video',
    className: 'video',
    template: false,

    mediaSourceWrapper: null,
    mediaSourceWrapperEvents: {
      'change:objectURL': '_onMediaSourceWrapperChangeObjectURL'
    },

    player: null,
    playerEvents: {
      'change:bufferType': '_onPlayerChangeBufferType',
      'change:state': '_onPlayerChangeState',
      'change:loadedSong': '_onPlayerChangeLoadedSong',
      'receive:currentTimeHighPrecision': '_onPlayerReceiveCurrentTimeHighPrecision'
    },

    boundingClientRect: null,
    currentPageX: 0,
    currentPageY: 0,
    isHovered: false,

    initialize: function(options) {
      this.player = options.player;
      this.mediaSourceWrapper = new MediaSourceWrapper();

      this.bindEntityEvents(this.player, this.playerEvents);
      this.bindEntityEvents(this.mediaSourceWrapper, this.mediaSourceWrapperEvents);

      // Bind pre-emptively to preserve the function reference. Allows for calling removeEventListener if needed.
      this._onWindowUnload = this._onWindowUnload.bind(this);
      this._onBodyMouseLeave = this._onBodyMouseLeave.bind(this);
      window.addEventListener('unload', this._onWindowUnload);
      // Need to use document.body over window here -- mouseleave event doesn't fire on window in chrome extension.
      document.body.addEventListener('mouseleave', this._onBodyMouseLeave);

      this.listenTo(StreamusFG.channels.window.vent, 'mouseMove', this._onWindowMouseMove);
      this.listenTo(StreamusFG.channels.window.vent, 'resize', this._onWindowResize);

      this._ensureInitialState(this.player.get('state'), this.player.get('bufferType'));
    },

    onRender: function() {
      var loadedSong = this.player.get('loadedSong');
      this._setHiddenState(_.isNull(loadedSong));
    },

    onShow: function() {
      this._setBoundingClientRect();
    },

    onBeforeDestroy: function() {
      window.removeEventListener('unload', this._onWindowUnload);
      document.body.removeEventListener('mouseleave', this._onBodyMouseLeave);
      this.mediaSourceWrapper.cleanup();
    },

    _onPlayerChangeState: function(player, state) {
      this._syncPlayingState(state);
    },

    _onPlayerChangeLoadedSong: function(player, loadedSong) {
      this._setHiddenState(_.isNull(loadedSong));
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

    _onWindowMouseMove: function(event) {
      if (this.isRendered) {
        this.currentPageX = event.pageX;
        this.currentPageY = event.pageY;
        this._setHoveredState(event.target === this.el);
      }
    },

    _onBodyMouseLeave: function() {
      requestAnimationFrame(function() {
        if (!this.isDestroyed) {
          this.$el.removeClass('is-hovered');
          this.isHovered = false;
        }
      }.bind(this));
    },

    _onWindowResize: function() {
      this._setBoundingClientRect();
      //this._setHoveredState();
    },

    // Whenever a video is created its time/state might not be synced with an existing video.
    _ensureInitialState: function(playerState, playerBufferType) {
      this.mediaSourceWrapper.set('bufferType', playerBufferType);
      this._requestCurrentTimeUpdate();
      this._syncPlayingState(playerState);
    },

    _setVideoSrc: function(objectURL) {
      var videoSrc = _.isNull(objectURL) ? '' : objectURL;
      this.el.src = videoSrc;
    },

    _play: function() {
      // It's important to call syncCurrentTime when beginning playback because there's a slight delay between
      // when the video in the background begins playback and the foreground video.
      this._requestCurrentTimeUpdate();
      this.el.play();
    },

    _pause: function() {
      this.el.pause();
    },

    _requestCurrentTimeUpdate: function() {
      // It's important to specifically ask the player for the currentTime because this will give 100% accurate result.
      // Otherwise, can only get within ~200ms by responding to the 'timeupdate' event of the other video.
      this.player.requestCurrentTimeHighPrecision();
    },

    _setCurrentTime: function(playerState, currentTimeHighPrecision, timestamp) {
      // If the player is playing then currentTimeHighPrecision will be slightly out-of-sync due to the time it takes to request
      // the information. So, subtract an offset of the time it took to receive the message.
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
    },

    _setBoundingClientRect: function() {
      this.boundingClientRect = this.el.getBoundingClientRect();
    },

    _setHiddenState: function(isHidden) {
      this.$el.toggleClass('is-hidden', isHidden);
    },

    // Determine whether the mouse is hovering over the video element and set its state accordingly.
    // When hovered, the video becomes transparent and pointer events will pass through to elements visually underneath it.
    // Need to monitor the window's pageX and pageY values rather than rely on :hover because setting pointer-events: none
    // will cause the :hover state to flicker.
    _setHoveredState: function(isTargetingElement) {
      var pageX = this.currentPageX;
      var pageY = this.currentPageY;
      var boundingClientRect = this.boundingClientRect;

      var isWithinHorizontalBounds = pageX >= boundingClientRect.left && pageX <= boundingClientRect.right;
      var isWithinVerticalBounds = pageY >= boundingClientRect.top && pageY <= boundingClientRect.bottom;
      var isMouseOverClientRect = isWithinHorizontalBounds && isWithinVerticalBounds;

      if (isMouseOverClientRect) {
        if (!this.isHovered && isTargetingElement) {
          this.$el.addClass('is-hovered');
          this.isHovered = true;
        }
      } else {
        this.$el.removeClass('is-hovered');
        this.isHovered = false;
      }
    }
  });

  return VideoView;
});