define(function(require) {
  'use strict';

  var SongType = require('background/enum/songType');
  var Utility = require('common/utility');

  var Song = Backbone.Model.extend({
    defaults: {
      // ID is a YouTube Video ID
      id: '',
      // Title is immutable. PlaylistItem might support editing the title, but applied to the PlaylistItem and not to Song.
      title: '',
      author: '',
      // Duration in seconds for the length of the given song.
      duration: -1,
      type: SongType.None,

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

    // Certain songs are not desireable when using radio mode.
    // If a song is too long, or a parody, or live then it's not great to random into.
    isDesireableSong: function() {
      // Duration greater than 8 minutes (480 seconds) is assumed to be multiple songs
      var isNotTooLong = this.get('duration') < 480;
      var lowerCaseSongTitle = this.get('title').toLowerCase();
      var isNotLive = lowerCaseSongTitle.indexOf('live') === -1;
      var isNotParody = lowerCaseSongTitle.indexOf('parody') === -1;

      var isDesireableSong = isNotTooLong && isNotLive && isNotParody;
      return isDesireableSong;
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

    // Return whether the given song is thought to be the same as the current.
    isSameSong: function(song) {
      var isMatchingId = song.get('id') === this.get('id');
      var isMatchingCleanTitle = song.get('cleanTitle') === this.get('cleanTitle');
      var isSameSong = isMatchingId || isMatchingCleanTitle;

      return isSameSong;
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

  return Song;
});