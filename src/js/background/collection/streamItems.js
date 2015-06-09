define(function(require) {
  'use strict';

  var ChromeCommand = require('background/enum/chromeCommand');
  var CollectionMultiSelect = require('background/mixin/collectionMultiSelect');
  var CollectionSequence = require('background/mixin/collectionSequence');
  var CollectionUniqueSong = require('background/mixin/collectionUniqueSong');
  var StreamItem = require('background/model/streamItem');
  var Songs = require('background/collection/songs');
  var YouTubeV3API = require('background/model/youTubeV3API');

  var StreamItems = Backbone.Collection.extend({
    model: StreamItem,
    localStorage: new Backbone.LocalStorage('StreamItems'),
    userFriendlyName: chrome.i18n.getMessage('stream'),
    mixins: [CollectionMultiSelect, CollectionSequence, CollectionUniqueSong],

    initialize: function() {
      this.on('add', this._onAdd);
      this.on('remove', this._onRemove);
      this.on('change:playedRecently', this._onChangePlayedRecently);
      this.on('change:active', this._onChangeActive);
      chrome.runtime.onMessage.addListener(this._onChromeRuntimeMessage.bind(this));
      chrome.commands.onCommand.addListener(this._onChromeCommandsCommand.bind(this));

      // Load any existing StreamItems from local storage
      this.fetch();
    },

    clear: function() {
      // Reset and clear instead of going through this.set() as a performance optimization
      this.reset();
      this.localStorage._clear();
    },

    getActiveItem: function() {
      return this.findWhere({
        active: true
      });
    },

    getActiveSongId: function() {
      var activeItem = this.getActiveItem();
      var activeSongId = null;

      if (!_.isUndefined(activeItem)) {
        activeSongId = activeItem.get('song').get('id');
      }

      return activeSongId;
    },

    getNotPlayedRecently: function() {
      return this.where({
        playedRecently: false
      });
    },

    getBySongId: function(songId) {
      return this.find(function(streamItem) {
        return streamItem.get('song').get('id') === songId;
      });
    },

    // Show a desktop notification with details regarding the currently active song.
    showActiveNotification: function() {
      var activeItem = this.getActiveItem();
      var activeSongId = activeItem.get('song').get('id');

      StreamusBG.channels.backgroundNotification.commands.trigger('show:notification', {
        iconUrl: 'https://img.youtube.com/vi/' + activeSongId + '/default.jpg',
        title: activeItem.get('title')
      });
    },

    // Return a random song from the pool of related songs.
    // Used for seeding the upcoming songs in radio mode.
    getRandomRelatedSong: function() {
      var relatedSongs = this._getRelatedSongs();

      if (relatedSongs.length === 0) {
        throw new Error('No related songs found:' + JSON.stringify(this));
      }

      var relatedSong = relatedSongs[_.random(relatedSongs.length - 1)];
      return relatedSong;
    },

    // Convert a single song, array of songs, or collection of songs to StreamItems
    // and attempt to add them to the collection. Fail to add if non-unique.
    // Immediately save the songs as they're only stored in localStorage.
    addSongs: function(songs, options) {
      options = _.isUndefined(options) ? {} : options;
      songs = songs instanceof Backbone.Collection ? songs.models : _.isArray(songs) ? songs : [songs];

      if (options.playOnAdd) {
        StreamusBG.channels.player.commands.trigger('playOnActivate', true);
      }

      var index = _.isUndefined(options.index) ? this.length : options.index;

      var createdStreamItems = [];
      _.each(songs, function(song) {
        var addedStreamItem = this._tryAddSongAtIndex(song, index);

        // If the item was added successfully to the collection (not duplicate) then allow for it to be created.
        if (!_.isNull(addedStreamItem)) {
          addedStreamItem.save();
          createdStreamItems.push(addedStreamItem);
          index++;
        }
      }, this);

      // TODO: Presumably not needed with BB 1.2
      if (createdStreamItems.length > 0) {
        // Emit a custom event signaling items have been added.
        // Useful for not responding to add until all items have been added.
        this.trigger('add:completed', this);
      }

      if (options.playOnAdd || options.markFirstActive) {
        if (createdStreamItems.length > 0) {
          createdStreamItems[0].save({
            active: true
          });
        } else {
          this._activateBySongId(songs[0].get('id'));
        }
      }

      return createdStreamItems;
    },

    getDisplayInfo: function() {
      var songs = new Songs(this.pluck('song'));
      var displayInfo = songs.getDisplayInfo();
      return displayInfo;
    },

    // Find a model by its song's id and mark it active.
    // If it is already active, re-trigger a change:active to ensure program state updates.
    _activateBySongId: function(songId) {
      var streamItemToActivate = this.getBySongId(songId);

      if (streamItemToActivate.get('active')) {
        streamItemToActivate.trigger('change:active', streamItemToActivate, true);
      } else {
        streamItemToActivate.save({
          active: true
        });
      }
    },

    _onAdd: function(model) {
      // Ensure a streamItem is always active
      if (_.isUndefined(this.getActiveItem())) {
        model.save({
          active: true
        });
      }
    },

    _onRemove: function(model) {
      // Destroy the model so that Backbone.LocalStorage keeps localStorage up-to-date.
      model.destroy();

      // Ensure there are always valid shuffle targets.
      // If the removed item was the last remaining valid shuffle target then the valid targets need to be updated.
      this._ensureAllNotPlayedRecentlyExcept();
    },

    _onChangeActive: function(model, active) {
      // Ensure only one streamItem is active at a time by deactivating all other active streamItems.
      if (active) {
        this._deactivateAllExcept(model);
      }
    },

    _onChangePlayedRecently: function(model, playedRecently) {
      if (playedRecently) {
        this._ensureAllNotPlayedRecentlyExcept(model);
      }
    },

    // Beatport can send messages to add stream items and play directly if user has clicked on a button.
    _onChromeRuntimeMessage: function(request) {
      switch (request.method) {
        case 'searchAndStreamByQuery':
          this._searchAndAddByTitle({
            title: request.query,
            playOnAdd: true,
            error: function(error) {
              console.error('Failed to add song by title: ' + request.query, error);
            }
          });
          break;
        case 'searchAndStreamByQueries':
          this._addByTitleList(true, request.queries);
          break;
      }
    },

    _onChromeCommandsCommand: function(command) {
      // Only respond to a subset of commands because all commands get broadcast, but not all are for this entity.
      // jscs:disable maximumLineLength
      var commands = [ChromeCommand.ShowSongDetails, ChromeCommand.DeleteSong, ChromeCommand.CopySongUrl, ChromeCommand.CopySongTitleAndUrl, ChromeCommand.SaveSong];
      // jscs:enable maximumLineLength

      if (_.contains(commands, command)) {
        this._handleChromeCommand(command);
      }
    },

    // Recursively iterate over a list of titles and add corresponding songs to the collection.
    // Do this recursively as to not flood the network with requests and to preserve the order
    // of songs added with respect to the order of the titles in the list.
    _addByTitleList: function(playOnAdd, titleList) {
      if (titleList.length > 0) {
        var title = titleList.shift();

        this._searchAndAddByTitle({
          title: title,
          playOnAdd: playOnAdd,
          error: function(error) {
            console.error('Failed to add song by title: ' + title, error);
          },
          complete: this._addByTitleList.bind(this, false, titleList)
        });
      }
    },

    // Search Youtube for a song by its title.
    // Add the first result found to the collection.
    _searchAndAddByTitle: function(options) {
      YouTubeV3API.getSongByTitle({
        title: options.title,
        success: function(song) {
          this.addSongs(song, {
            playOnAdd: !!options.playOnAdd
          });

          if (options.success) {
            options.success();
          }
        }.bind(this),
        error: options.error,
        complete: options.complete
      });
    },

    // Mark all models inactive except for an optionally excluded item.
    _deactivateAllExcept: function(changedStreamItem) {
      this.each(function(streamItem) {
        // Be sure to check if it is active before saving to avoid hammering localStorage.
        if (streamItem !== changedStreamItem && streamItem.get('active')) {
          streamItem.save({
            active: false
          });
        }
      });
    },

    // Take each streamItem's array of related songs, pluck them all out into a collection of arrays
    // then flatten the arrays into a single array of songs.
    _getRelatedSongs: function() {
      // Some items may not have related information due to lack of response from YouTube or simply a lack of information.
      var relatedSongs = _.flatten(this.map(function(streamItem) {
        return streamItem.get('relatedSongs').models;
      }));

      // Don't add any songs that are already in the stream.
      relatedSongs = _.reject(relatedSongs, this._hasSong, this);

      // Filter non-desireable songs based on set of rules
      var desireableRelatedSongs = _.filter(relatedSongs, function(relatedSong) {
        return relatedSong.isDesireableSong();
      });

      // Don't filter out non-desireable songs if it would result in nothing to play.
      if (desireableRelatedSongs.length > 0) {
        relatedSongs = desireableRelatedSongs;
      }

      return relatedSongs;
    },

    // Returns whether the given song is already in the collection
    _hasSong: function(song) {
      var containsSong = this.any(function(model) {
        return model.get('song').isSameSong(song);
      });

      return containsSong;
    },

    // When all streamItems have been played recently, reset to not having been played recently.
    // Allows for de-prioritization of played streamItems during shuffling.
    _ensureAllNotPlayedRecentlyExcept: function(model) {
      var modelsPlayedRecently = this.where({
        playedRecently: true
      });

      var allModelsPlayedRecently = modelsPlayedRecently.length === this.length;

      if (allModelsPlayedRecently) {
        this.each(function(streamItem) {
          if (streamItem !== model) {
            streamItem.save({
              playedRecently: false
            });
          }
        });
      }
    },

    // Let the user know that their keyboard command wasn't able to be fulfilled.
    _notifyCommandFailure: function() {
      StreamusBG.channels.notification.commands.trigger('show:notification', {
        title: chrome.i18n.getMessage('keyboardCommandFailure'),
        message: chrome.i18n.getMessage('streamEmpty')
      });
    },

    // Take a user's keyboard shortcut command and apply the desired action
    _handleChromeCommand: function(command) {
      if (this.isEmpty()) {
        this._notifyCommandFailure();
      } else {
        switch (command) {
          case ChromeCommand.ShowSongDetails:
            this.showActiveNotification();
            break;
          case ChromeCommand.DeleteSong:
            this.getActiveItem().destroy();
            break;
          case ChromeCommand.CopySongUrl:
            this.getActiveItem().get('song').copyUrl();
            break;
          case ChromeCommand.CopySongTitleAndUrl:
            this.getActiveItem().get('song').copyTitleAndUrl();
            break;
          case ChromeCommand.SaveSong:
            StreamusBG.channels.activePlaylist.commands.trigger('save:song', this.getActiveItem().get('song'));
            break;
        }
      }
    },

    // Creates a StreamItem from a given song and attempts to insert it into the collection.
    // Returns the created item unless insertion fails due to non-uniqueness.
    _tryAddSongAtIndex: function(song, index) {
      var streamItem = new StreamItem({
        song: song,
        title: song.get('title'),
        sequence: this.getSequenceFromIndex(index)
      });

      // Provide the index that the item will be placed at because allowing re-sorting the collection is expensive.
      this.add(streamItem, {
        at: index
      });

      // Add will return the existing item, so check the attempted item's collection to confirm if it was added.
      var songWasAdded = !_.isUndefined(streamItem.collection);

      return songWasAdded ? streamItem : null;
    }
  });

  return StreamItems;
});