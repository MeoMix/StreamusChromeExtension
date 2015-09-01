'use strict';
import {Model} from 'backbone';
import VideoType from 'background/enum/videoType';
import Utility from 'common/utility';

var Video = Model.extend({
  defaults: {
    // ID is a YouTube Video ID
    id: '',
    // Title is immutable. PlaylistItem might support editing the title, but applied to the PlaylistItem and not to Video.
    title: '',
    author: '',
    // Duration in seconds for the length of the given video.
    duration: -1,
    type: VideoType.None,

    // These are calculated:
    prettyDuration: '',
    url: '',
    cleanTitle: ''
  },

  initialize: function() {
    this._setPrettyDuration(this.get('duration'));
    this._setCleanTitle(this.get('title'));
    this._setUrl(this.get('id'));
  },

  // Certain videos are not desireable when using radio mode.
  // If a video is too long, or a parody, or live then it's not great to random into.
  isDesireableVideo: function() {
    // Duration greater than 8 minutes (480 seconds) is assumed to be multiple videos
    var isNotTooLong = this.get('duration') < 480;
    var lowerCaseVideoTitle = this.get('title').toLowerCase();
    var isNotLive = lowerCaseVideoTitle.indexOf('live') === -1;
    var isNotParody = lowerCaseVideoTitle.indexOf('parody') === -1;

    var isDesireableVideo = isNotTooLong && isNotLive && isNotParody;
    return isDesireableVideo;
  },

  copyUrl: function() {
    var url = this.get('url');
    StreamusBG.channels.clipboard.commands.trigger('copy:text', url);

    StreamusBG.channels.notification.commands.trigger('show:notification', {
      message: chrome.i18n.getMessage('urlCopied')
    });
  },

  copyTitleAndUrl: function() {
    var titleAndUrl = this.get('title') + ' - ' + this.get('url');
    StreamusBG.channels.clipboard.commands.trigger('copy:text', titleAndUrl);

    StreamusBG.channels.notification.commands.trigger('show:notification', {
      message: chrome.i18n.getMessage('urlCopied')
    });
  },

  // Return whether the given video is thought to be the same as the current.
  isSameVideo: function(video) {
    var isMatchingId = video.get('id') === this.get('id');
    var isMatchingCleanTitle = video.get('cleanTitle') === this.get('cleanTitle');
    var isSameVideo = isMatchingId || isMatchingCleanTitle;

    return isSameVideo;
  },

  // Calculate this value pre-emptively because when rendering I don't want to incur inefficiency
  _setPrettyDuration: function(duration) {
    this.set('prettyDuration', Utility.prettyPrintTime(duration));
  },

  // Useful for comparisons and other searching.
  _setCleanTitle: function(title) {
    this.set('cleanTitle', Utility.cleanTitle(title));
  },

  _setUrl: function(id) {
    this.set('url', 'https://youtu.be/' + id);
  }
});

export default Video;