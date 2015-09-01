'use strict';
import {Collection, Model} from 'backbone';
import Videos from 'background/collection/videos';
import Video from 'background/model/video';
import ListItemType from 'common/enum/listItemType';

var StreamItem = Model.extend({
  defaults: function() {
    return {
      id: null,
      video: null,
      // Used to weight randomness in shuffle. Resets to false when all in collection are set to true.
      playedRecently: false,
      active: false,
      selected: false,
      firstSelected: false,
      relatedVideos: new Videos(),
      sequence: -1,
      listItemType: ListItemType.StreamItem
    };
  },

  // Don't want to save everything to localStorage -- only variables which need to be persisted.
  blacklist: ['selected', 'firstSelected'],
  toJSON: function() {
    return this.omit(this.blacklist);
  },

  initialize: function() {
    this._ensureVideoModel();
    this._ensureRelatedVideosCollection();
    this.on('change:active', this._onChangeActive);
  },

  _ensureVideoModel: function() {
    var video = this.get('video');

    // Need to convert video object to Backbone.Model
    if (!(video instanceof Model)) {
      // Silent because video is just being properly set.
      this.set('video', new Video(video), {silent: true});
    }
  },

  _ensureRelatedVideosCollection: function() {
    var relatedVideos = this.get('relatedVideos');

    // Need to convert relatedVideos array to Backbone.Collection
    if (!(relatedVideos instanceof Collection)) {
      // Silent because relatedVideos is just being properly set.
      this.set('relatedVideos', new Videos(relatedVideos), {
        silent: true
      });
    }
  },

  // Whenever a streamItem is activated it is considered playedRecently.
  // This will reset when all streamItems in the stream have been played recently.
  _onChangeActive: function(model, active) {
    if (active && !this.get('playedRecently')) {
      this.save({playedRecently: true});
    }
  }
});

export default StreamItem;