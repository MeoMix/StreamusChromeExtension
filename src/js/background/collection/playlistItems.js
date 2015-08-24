define(function(require) {
  'use strict';

  var CollectionMultiSelect = require('background/mixin/collectionMultiSelect');
  var CollectionSequence = require('background/mixin/collectionSequence');
  var CollectionUniqueVideo = require('background/mixin/collectionUniqueVideo');
  var PlaylistItem = require('background/model/playlistItem');
  var Videos = require('background/collection/videos');
  var Utility = require('common/utility');

  var PlaylistItems = Backbone.Collection.extend({
    model: PlaylistItem,
    playlistId: -1,
    userFriendlyName: chrome.i18n.getMessage('playlist'),
    mixins: [CollectionMultiSelect, CollectionSequence, CollectionUniqueVideo],

    url: function() {
      return StreamusBG.serverUrl + 'PlaylistItem/';
    },

    initialize: function(models, options) {
      this.playlistId = options ? options.playlistId : this.playlistId;
    },

    // Convert a single video, array of videos, or collection of videos to PlaylistItems
    // and attempt to add them to the collection. Fail to add if non-unique.
    // Notify the server of all successfully added items so that they may be saved to DB.
    addVideos: function(videos, options) {
      options = _.isUndefined(options) ? {} : options;
      videos = videos instanceof Backbone.Collection ? videos.models : _.isArray(videos) ? videos : [videos];

      var itemsToCreate = [];
      var index = _.isUndefined(options.index) ? this.length : options.index;

      _.each(videos, function(video) {
        var addedPlaylistItem = this._tryAddVideoAtIndex(video, index);

        // If the item was added successfully to the collection (not duplicate) then allow for it to be created.
        if (!_.isNull(addedPlaylistItem)) {
          itemsToCreate.push(addedPlaylistItem);
          index++;
        }
      }, this);

      // Emit a custom event signaling all items have been added.
      // Useful for not responding to add until all items have been added.
      if (itemsToCreate.length > 0) {
        this.trigger('add:completed', this, itemsToCreate);

        // TODO: Do I care about saving properly before notifying?
        // TODO: Need to be able to read the playlist title instead of just using 'playlist'
        var notificationMessage;
        if (itemsToCreate.length === 1) {
          var videoTitle = Utility.truncateString(itemsToCreate[0].get('video').get('title'), 40);
          notificationMessage = chrome.i18n.getMessage('videoSavedToPlaylist', [videoTitle, 'playlist']);
        } else {
          notificationMessage = chrome.i18n.getMessage('videosSavedToPlaylist', [itemsToCreate.length, 'playlist']);
        }

        StreamusBG.channels.notification.commands.trigger('show:notification', {
          message: notificationMessage
        });
      }

      // Default to Backbone if only creating 1 item.
      if (itemsToCreate.length === 1) {
        itemsToCreate[0].save({}, {
          success: options.success,
          error: options.error
        });
      } else {
        this._bulkCreate(itemsToCreate, options);
      }
    },

    getDisplayInfo: function() {
      var videos = new Videos(this.pluck('video'));
      var displayInfo = videos.getDisplayInfo();
      return displayInfo;
    },

    _tryAddVideoAtIndex: function(video, index) {
      var playlistItem = new PlaylistItem({
        playlistId: this.playlistId,
        video: video,
        sequence: this.getSequenceFromIndex(index)
      });

      // Provide the index that the item will be placed at because allowing re-sorting the collection is expensive.
      this.add(playlistItem, {
        at: index
      });

      // Add will return the existing item, so check the attempted item's collection to confirm if it was added.
      var videoWasAdded = !_.isUndefined(playlistItem.collection);

      return videoWasAdded ? playlistItem : null;
    },

    // Non-RESTful bulk API request for creating multiple models.
    // Re-maps the server's response to each model on success.
    _bulkCreate: function(models, options) {
      $.ajax({
        url: StreamusBG.serverUrl + 'PlaylistItem/CreateMultiple',
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(models),
        success: function(createdObjects) {
          // Map potentially updated properties of createdObjects onto existing models.
          _.each(createdObjects, function(createdObject) {
            this._mapCreatedToExisting(createdObject);
          }, this);

          if (options && options.success) {
            options.success();
          }
        }.bind(this),
        error: options ? options.error : null
      });
    },

    _mapCreatedToExisting: function(createdObject) {
      // Use find rather than where when working with 'cid' otherwise lookup will fail.
      var existingModel = this.find(function(model) {
        return model.cid === createdObject.cid;
      });

      // Emulate going through native save logic.
      var parsedModel = existingModel.parse(createdObject);
      existingModel.set(parsedModel);
    },

    _getByVideoId: function(videoId) {
      return this.find(function(playlistItem) {
        return playlistItem.get('video').get('id') === videoId;
      });
    }
  });

  return PlaylistItems;
});