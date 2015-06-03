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