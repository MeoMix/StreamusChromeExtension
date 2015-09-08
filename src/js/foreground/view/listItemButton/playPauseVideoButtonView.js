import _ from 'common/shim/lodash.reference.shim';
import {LayoutView} from 'marionette';
import ListItemButton from 'foreground/view/behavior/listItemButton';
import PlayPauseVideoButtonTemplate from 'template/listItemButton/playPauseVideoButton.html!text';
import PlayIconTemplate from 'template/icon/playIcon_18.svg!text';
import PauseIconTemplate from 'template/icon/pauseIcon_18.svg!text';

var PlayPauseVideoButtonView = LayoutView.extend({
  template: _.template(PlayPauseVideoButtonTemplate),
  templateHelpers: {
    playIcon: _.template(PlayIconTemplate)(),
    pauseIcon: _.template(PauseIconTemplate)()
  },

  attributes: {
    'data-tooltip-text': chrome.i18n.getMessage('play')
  },

  ui: {
    playIcon: 'playIcon',
    pauseIcon: 'pauseIcon'
  },

  behaviors: {
    ListItemButton: {
      behaviorClass: ListItemButton
    }
  },

  streamItems: null,
  player: null,
  video: null,

  initialize: function(options) {
    this.streamItems = options.streamItems;
    this.player = options.player;
    this.video = options.video;
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
      this._playVideo();
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
    var activeVideoId = this.streamItems.getActiveVideoId();
    // The pause icon is visible only if the player is playing/buffering and the video is this video's video.
    var videoId = this.video.get('id');
    var isPlayerPausable = this.player.isPausable();
    var isPausable = activeVideoId === videoId && isPlayerPausable;

    return isPausable;
  },

  _playVideo: function() {
    // If there's only one video to be played - check if it's already in the stream.
    var streamItem = this.streamItems.getByVideoId(this.video.get('id'));

    if (_.isUndefined(streamItem)) {
      this.streamItems.addVideos(this.video, {
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

export default PlayPauseVideoButtonView;