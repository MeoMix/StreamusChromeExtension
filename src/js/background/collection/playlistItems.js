define(function(require) {
  'use strict';

  var CollectionMultiSelect = require('background/mixin/collectionMultiSelect');
  var CollectionSequence = require('background/mixin/collectionSequence');
  var CollectionUniqueSong = require('background/mixin/collectionUniqueSong');
  var PlaylistItem = require('background/model/playlistItem');
  var Utility = require('common/utility');

  var PlaylistItems = Backbone.Collection.extend({
    model: PlaylistItem,
    playlistId: -1,
    userFriendlyName: chrome.i18n.getMessage('playlist'),
    mixins: [CollectionMultiSelect, CollectionSequence, CollectionUniqueSong],

    url: function() {
      return StreamusBG.serverUrl + 'PlaylistItem/';
    },

    initialize: function(models, options) {
      this.playlistId = options ? options.playlistId : this.playlistId;
    },

    // Convert a single song, array of songs, or collection of songs to PlaylistItems
    // and attempt to add them to the collection. Fail to add if non-unique.
    // Notify the server of all successfully added items so that they may be saved to DB.
    addSongs: function(songs, options) {
      options = _.isUndefined(options) ? {} : options;
      songs = songs instanceof Backbone.Collection ? songs.models : _.isArray(songs) ? songs : [songs];

      var itemsToCreate = [];
      var index = _.isUndefined(options.index) ? this.length : options.index;

      _.each(songs, function(song) {
        var addedPlaylistItem = this._tryAddSongAtIndex(song, index);

        // If the item was added successfully to the collection (not duplicate) then allow for it to be created.
        if (addedPlaylistItem !== null) {
          itemsToCreate.push(addedPlaylistItem);
          index++;
        }
      }, this);

      // TODO: Presumably not needed with BB 1.2
      // Emit a custom event signaling all items have been added.
      // Useful for not responding to add until all items have been added.
      if (itemsToCreate.length > 0) {
        this.trigger('add:completed', this);
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

    // Return a string similiar to '15 songs, 4 hours' influenced by
    // the collection's length and sum of song durations.
    getDisplayInfo: function() {
      var totalItemsDuration = this._getTotalDuration();
      var prettyTimeWithWords = Utility.prettyPrintTimeWithWords(totalItemsDuration);

      var songs = this.pluck('song');
      var songString = chrome.i18n.getMessage(songs.length === 1 ? 'song' : 'songs');

      var displayInfo = songs.length + ' ' + songString + ', ' + prettyTimeWithWords;
      return displayInfo;
    },

    // Returns the sum of the durations of all songs in the collection (in seconds)
    _getTotalDuration: function() {
      var songDurations = _.invoke(this.pluck('song'), 'get', 'duration');
      var totalDuration = _.reduce(songDurations, function(memo, songDuration) {
        return memo + parseInt(songDuration, 10);
      }, 0);

      return totalDuration;
    },

    _tryAddSongAtIndex: function(song, index) {
      var playlistItem = new PlaylistItem({
        playlistId: this.playlistId,
        song: song,
        title: song.get('title'),
        sequence: this.getSequenceFromIndex(index)
      });

      // Provide the index that the item will be placed at because allowing re-sorting the collection is expensive.
      this.add(playlistItem, {
        at: index
      });

      // Add will return the existing item, so check the attempted item's collection to confirm if it was added.
      var songWasAdded = !_.isUndefined(playlistItem.collection);

      return songWasAdded ? playlistItem : null;
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

    _getBySongId: function(songId) {
      return this.find(function(playlistItem) {
        return playlistItem.get('song').get('id') === songId;
      });
    }
  });

  return PlaylistItems;
});