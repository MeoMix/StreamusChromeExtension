define(function(require) {
  'use strict';

  var ListItemButton = require('foreground/view/behavior/listItemButton');
  var PlayPauseSongButtonTemplate = require('text!template/listItemButton/playPauseSongButton.html');
  var PlayIconTemplate = require('text!template/icon/playIcon_18.svg');
  var PauseIconTemplate = require('text!template/icon/pauseIcon_18.svg');

  var PlayPauseSongButtonView = Marionette.ItemView.extend({
    template: _.template(PlayPauseSongButtonTemplate),
    templateHelpers: {
      playIcon: _.template(PlayIconTemplate)(),
      pauseIcon: _.template(PauseIconTemplate)()
    },

    attributes: {
      'data-tooltip-text': chrome.i18n.getMessage('play')
    },

    ui: {
      playIcon: '[data-ui~=playIcon]',
      pauseIcon: '[data-ui~=pauseIcon]'
    },

    behaviors: {
      ListItemButton: {
        behaviorClass: ListItemButton
      }
    },

    streamItems: null,
    player: null,
    song: null,

    initialize: function(options) {
      this.streamItems = options.streamItems;
      this.player = options.player;
      this.song = options.song;
      this.listenTo(this.player, 'change:state', this._onPlayerChangeState);
      this.listenTo(this.streamItems, 'change:active', this._onStreamItemsChangeActive);
    },

    onRender: function() {
      this._setState();
    },

    onClick: function() {
      var isPausable = this._isPausable();

      if (isPausable) {
        this.player.pause();
      } else {
        this._playSong();
      }
    },

    _onPlayerChangeState: function() {
      this._setState();
    },

    _onStreamItemsChangeActive: function() {
      this._setState();
    },

    _setState: function() {
      var isPausable = this._isPausable();
      this.ui.pauseIcon.toggleClass('is-hidden', !isPausable);
      this.ui.playIcon.toggleClass('is-hidden', isPausable);
    },

    _isPausable: function() {
      var activeSongId = this.streamItems.getActiveSongId();
      // The pause icon is visible only if the player is playing/buffering and the song is this song's song.
      var songId = this.song.get('id');
      var isPlayerPausable = this.player.isPausable();
      var isPausable = activeSongId === songId && isPlayerPausable;

      return isPausable;
    },

    _playSong: function() {
      // If there's only one song to be played - check if it's already in the stream.
      var streamItem = this.streamItems.getBySongId(this.song.get('id'));

      if (_.isUndefined(streamItem)) {
        this.streamItems.addSongs(this.song, {
          playOnAdd: true
        });
      } else {
        this._playStreamItem(streamItem);
      }
    },

    _playStreamItem: function(streamItem) {
      if (streamItem.get('active')) {
        this.player.play();
      } else {
        this.player.set('playOnActivate', true);
        streamItem.save({active: true});
      }
    }
  });

  return PlayPauseSongButtonView;
});