define(function(require) {
  'use strict';

  var Song = require('background/model/song');
  var Utility = require('common/utility');

  var Songs = Backbone.Collection.extend({
    model: Song,

    // Return a string similiar to '15 songs, 4 hours' influenced by
    // the collection's length and sum of song durations.
    getDisplayInfo: function() {
      var totalItemsDuration = this._getTotalDuration();
      var prettyTimeWithWords = Utility.prettyPrintTimeWithWords(totalItemsDuration);
      var songString = chrome.i18n.getMessage(this.length === 1 ? 'song' : 'songs');

      var displayInfo = this.length + ' ' + songString + ', ' + prettyTimeWithWords;
      return displayInfo;
    },

    // Returns the sum of the durations of all songs in the collection (in seconds)
    _getTotalDuration: function() {
      var songDurations = this.pluck('duration');
      var totalDuration = _.reduce(songDurations, function(memo, songDuration) {
        return memo + parseInt(songDuration, 10);
      }, 0);

      return totalDuration;
    }
  });

  return Songs;
});