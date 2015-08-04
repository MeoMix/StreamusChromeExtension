define(function(require) {
  'use strict';

  var ChromeCommand = require('background/enum/chromeCommand');
  var CollectionMultiSelect = require('background/mixin/collectionMultiSelect');
  var CollectionSequence = require('background/mixin/collectionSequence');
  var CollectionUniqueVideo = require('background/mixin/collectionUniqueVideo');
  var StreamItem = require('background/model/streamItem');
  var Videos = require('background/collection/videos');
  var YouTubeV3API = require('background/model/youTubeV3API');
  var Utility = require('common/utility');

  var StreamItems = Backbone.Collection.extend({
    model: StreamItem,
    localStorage: new Backbone.LocalStorage('StreamItems'),
    userFriendlyName: chrome.i18n.getMessage('stream'),
    mixins: [CollectionMultiSelect, CollectionSequence, CollectionUniqueVideo],

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

    // TODO: Maybe these should return null instead for consistency?
    getActiveItem: function() {
      return this.findWhere({
        active: true
      });
    },

    getActiveVideoId: function() {
      var activeItem = this.getActiveItem();
      var activeVideoId = null;

      if (!_.isUndefined(activeItem)) {
        activeVideoId = activeItem.get('video').get('id');
      }

      return activeVideoId;
    },

    getNotPlayedRecently: function() {
      return this.where({
        playedRecently: false
      });
    },

    getByVideoId: function(videoId) {
      return this.find(function(streamItem) {
        return streamItem.get('video').get('id') === videoId;
      });
    },

    // Show a desktop notification with details regarding the currently active video.
    showActiveNotification: function() {
      var activeItem = this.getActiveItem();
      var activeVideoId = activeItem.get('video').get('id');

      StreamusBG.channels.backgroundNotification.commands.trigger('show:notification', {
        iconUrl: 'https://img.youtube.com/vi/' + activeVideoId + '/default.jpg',
        title: activeItem.get('video').get('title')
      });
    },

    // Return a random video from the pool of related videos.
    // Used for seeding the upcoming videos in radio mode.
    getRandomRelatedVideo: function() {
      var relatedVideos = this._getRelatedVideos();

      if (relatedVideos.length === 0) {
        throw new Error('No related videos found:' + JSON.stringify(this));
      }

      var relatedVideo = relatedVideos[_.random(relatedVideos.length - 1)];
      return relatedVideo;
    },

    // Convert a single video, array of videos, or collection of videos to StreamItems
    // and attempt to add them to the collection. Fail to add if non-unique.
    // Immediately save the videos as they're only stored in localStorage.
    addVideos: function(videos, options) {
      options = _.isUndefined(options) ? {} : options;
      videos = videos instanceof Backbone.Collection ? videos.models : _.isArray(videos) ? videos : [videos];

      if (options.playOnAdd) {
        StreamusBG.channels.player.commands.trigger('playOnActivate', true);
      }

      var index = _.isUndefined(options.index) ? this.length : options.index;

      var createdStreamItems = [];
      _.each(videos, function(video) {
        var addedStreamItem = this._tryAddVideoAtIndex(video, index);

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
        this._showCreatedNotification(createdStreamItems);
      }

      if (options.playOnAdd || options.markFirstActive) {
        if (createdStreamItems.length > 0) {
          createdStreamItems[0].save({
            active: true
          });
        } else {
          this._activateByVideoId(videos[0].get('id'));
        }
      }

      return createdStreamItems;
    },

    getDisplayInfo: function() {
      var videos = new Videos(this.pluck('video'));
      var displayInfo = videos.getDisplayInfo();
      return displayInfo;
    },

    _showCreatedNotification: function(createdStreamItems) {
      var notificationMessage;
      if (createdStreamItems.length === 1) {
        var videoTitle = Utility.truncateString(createdStreamItems[0].get('video').get('title'), 40);
        notificationMessage = chrome.i18n.getMessage('videoAddedToStream', [videoTitle]);
      } else {
        notificationMessage = chrome.i18n.getMessage('videosAddedToStream', [createdStreamItems.length]);
      }

      StreamusBG.channels.notification.commands.trigger('show:notification', {
        message: notificationMessage
      });
    },

    // Find a model by its video's id and mark it active.
    // If it is already active, re-trigger a change:active to ensure program state updates.
    _activateByVideoId: function(videoId) {
      var streamItemToActivate = this.getByVideoId(videoId);

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
              console.error('Failed to add video by title: ' + request.query, error);
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
      var commands = [ChromeCommand.ShowVideoDetails, ChromeCommand.DeleteVideo, ChromeCommand.CopyVideoUrl, ChromeCommand.CopyVideoTitleAndUrl, ChromeCommand.SaveVideo];
      // jscs:enable maximumLineLength

      if (_.contains(commands, command)) {
        this._handleChromeCommand(command);
      }
    },

    // Recursively iterate over a list of titles and add corresponding videos to the collection.
    // Do this recursively as to not flood the network with requests and to preserve the order
    // of videos added with respect to the order of the titles in the list.
    _addByTitleList: function(playOnAdd, titleList) {
      if (titleList.length > 0) {
        var title = titleList.shift();

        this._searchAndAddByTitle({
          title: title,
          playOnAdd: playOnAdd,
          error: function(error) {
            console.error('Failed to add video by title: ' + title, error);
          },
          complete: this._addByTitleList.bind(this, false, titleList)
        });
      }
    },

    // Search Youtube for a video by its title.
    // Add the first result found to the collection.
    _searchAndAddByTitle: function(options) {
      YouTubeV3API.getVideoByTitle({
        title: options.title,
        success: function(video) {
          this.addVideos(video, {
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

    // Take each streamItem's array of related videos, pluck them all out into a collection of arrays
    // then flatten the arrays into a single array of videos.
    _getRelatedVideos: function() {
      // Some items may not have related information due to lack of response from YouTube or simply a lack of information.
      var relatedVideos = _.flatten(this.map(function(streamItem) {
        return streamItem.get('relatedVideos').models;
      }));

      // Don't add any videos that are already in the stream.
      relatedVideos = _.reject(relatedVideos, this._hasVideo, this);

      // Filter non-desireable videos based on set of rules
      var desireableRelatedVideos = _.filter(relatedVideos, function(relatedVideo) {
        return relatedVideo.isDesireableVideo();
      });

      // Don't filter out non-desireable videos if it would result in nothing to play.
      if (desireableRelatedVideos.length > 0) {
        relatedVideos = desireableRelatedVideos;
      }

      return relatedVideos;
    },

    // Returns whether the given video is already in the collection
    _hasVideo: function(video) {
      var containsVideo = this.any(function(model) {
        return model.get('video').isSameVideo(video);
      });

      return containsVideo;
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
          case ChromeCommand.ShowVideoDetails:
            this.showActiveNotification();
            break;
          case ChromeCommand.DeleteVideo:
            this.getActiveItem().destroy();
            break;
          case ChromeCommand.CopyVideoUrl:
            this.getActiveItem().get('video').copyUrl();
            break;
          case ChromeCommand.CopyVideoTitleAndUrl:
            this.getActiveItem().get('video').copyTitleAndUrl();
            break;
          case ChromeCommand.SaveVideo:
            StreamusBG.channels.activePlaylist.commands.trigger('save:video', this.getActiveItem().get('video'));
            break;
        }
      }
    },

    // Creates a StreamItem from a given video and attempts to insert it into the collection.
    // Returns the created item unless insertion fails due to non-uniqueness.
    _tryAddVideoAtIndex: function(video, index) {
      var streamItem = new StreamItem({
        video: video,
        sequence: this.getSequenceFromIndex(index)
      });

      // Provide the index that the item will be placed at because allowing re-sorting the collection is expensive.
      this.add(streamItem, {
        at: index
      });

      // Add will return the existing item, so check the attempted item's collection to confirm if it was added.
      var videoWasAdded = !_.isUndefined(streamItem.collection);

      return videoWasAdded ? streamItem : null;
    }
  });

  return StreamItems;
});