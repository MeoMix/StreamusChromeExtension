define(function(require) {
  'use strict';

  var Video = require('background/model/video');
  var Utility = require('common/utility');

  var Videos = Backbone.Collection.extend({
    model: Video,

    // Return a string similiar to '15 videos, 4 hours' influenced by
    // the collection's length and sum of video durations.
    getDisplayInfo: function() {
      var totalItemsDuration = this._getTotalDuration();
      var prettyTimeWithWords = Utility.prettyPrintTimeWithWords(totalItemsDuration);
      var videoString = chrome.i18n.getMessage(this.length === 1 ? 'video' : 'videos');

      var displayInfo = this.length + ' ' + videoString + ', ' + prettyTimeWithWords;
      return displayInfo;
    },

    // Returns the sum of the durations of all videos in the collection (in seconds)
    _getTotalDuration: function() {
      var videoDurations = this.pluck('duration');
      var totalDuration = _.reduce(videoDurations, function(memo, videoDuration) {
        return memo + parseInt(videoDuration, 10);
      }, 0);

      return totalDuration;
    }
  });

  return Videos;
});