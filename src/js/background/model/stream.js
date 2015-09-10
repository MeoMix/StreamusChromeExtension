import _ from 'common/shim/lodash.reference.shim';
import {Model} from 'backbone';
import LocalStorage from 'lib/backbone.localStorage';
import StreamItems from 'background/collection/streamItems';
import RelatedVideosManager from 'background/model/relatedVideosManager';
import PlayerState from 'common/enum/playerState';
import RepeatButtonState from 'common/enum/repeatButtonState';

var Stream = Model.extend({
  localStorage: new LocalStorage('Stream'),

  defaults: function() {
    return {
      // Need to set the ID for Backbone.LocalStorage
      id: 'Stream',
      items: new StreamItems(),
      activeItem: null,
      relatedVideosManager: new RelatedVideosManager(),
      history: [],
      player: null,
      shuffleButton: null,
      radioButton: null,
      repeatButton: null
    };
  },

  // Don't want to save everything to localStorage -- only variables which need to be persisted.
  whitelist: ['history'],
  toJSON: function() {
    return this.pick(this.whitelist);
  },

  initialize: function() {
    this.listenTo(this.get('player'), 'change:state', this._onPlayerChangeState);
    this.listenTo(this.get('player'), 'youTubeError', this._onPlayerYouTubeError);
    this.listenTo(this.get('items'), 'add', this._onItemsAdd);
    this.listenTo(this.get('items'), 'remove', this._onItemsRemove);
    this.listenTo(this.get('items'), 'reset', this._onItemsReset);
    this.listenTo(this.get('items'), 'change:active', this._onItemsChangeActive);

    this.fetch();

    var activeItem = this.get('items').getActiveItem();
    if (!_.isUndefined(activeItem)) {
      this.set('activeItem', activeItem);
      this.get('player').activateVideo(activeItem.get('video'));
    }

    // Ensure that localStorage data is valid
    this.get('items').each(function(streamItem) {
      this._ensureHasRelatedVideos(streamItem);
    }, this);
  },

  // If a streamItem which was active is removed, activateNext will have a removedActiveItemIndex provided
  activateNext: function(removedActiveItemIndex) {
    /* jshint ignore:start */
    var nextItem = null;

    var shuffleEnabled = this.get('shuffleButton').get('enabled');
    var radioEnabled = this.get('radioButton').get('enabled');
    var repeatButtonState = this.get('repeatButton').get('state');
    var items = this.get('items');
    var currentActiveItem = items.getActiveItem();

    // If removedActiveItemIndex is provided, RepeatVideo doesn't matter because the video was deleted.
    if (_.isUndefined(removedActiveItemIndex) && repeatButtonState === RepeatButtonState.RepeatVideo) {
      nextItem = currentActiveItem;
      nextItem.trigger('change:active', nextItem, true);
    } else if (shuffleEnabled) {
      var eligibleItems = items.getNotPlayedRecently();

      // All videos will be played recently if there's only one item because it just finished playing.
      if (eligibleItems.length > 0) {
        nextItem = _.sample(eligibleItems);
        nextItem.save({active: true});
      }
    } else {
      var nextItemIndex;

      if (!_.isUndefined(removedActiveItemIndex)) {
        nextItemIndex = removedActiveItemIndex;
      } else {
        nextItemIndex = items.indexOf(items.getActiveItem()) + 1;

        if (nextItemIndex <= 0) {
          throw new Error('Failed to find nextItemIndex. More info: ' + JSON.stringify(items));
        }
      }

      // Activate the next item by index. Potentially go back one if deleting last item.
      if (nextItemIndex === items.length) {
        if (repeatButtonState === RepeatButtonState.RepeatAll) {
          nextItem = items.first();

          // If there's only 1 item in the stream during a skip then the index will loop back to the front.
          // Need to re-send the 'active' trigger to refresh the UI.
          if (nextItem.get('active')) {
            nextItem.trigger('change:active', nextItem, true);
          } else {
            nextItem.save({active: true});
          }
        } else if (radioEnabled) {
          var randomRelatedVideo = items.getRandomRelatedVideo();

          var addedVideos = items.addVideos(randomRelatedVideo, {
            // Mark as active after adding it to deselect other active items and ensure it is visible visually.
            markFirstActive: true
          });

          nextItem = addedVideos[0];
        } else if (!_.isUndefined(removedActiveItemIndex)) {
          // Pause on the last active item if there's nothing to skip to during a delete.
          // Apply after checking 'radioEnabled' because it's OK to skip to new 'radio' video during delete.
          items.last().save({active: true});
          this.get('player').pause();
        } else {
          // Pause on first item in list because playlist looping should stop.
          items.first().save({active: true});
          this.get('player').pause();
        }
      } else {
        nextItem = items.at(nextItemIndex);
        nextItem.save({active: true});
      }
    }

    // Push the last active item into history when going forward:
    if (!_.isNull(nextItem) && !_.isUndefined(currentActiveItem)) {
      // If the last item (sequentially) is removed and it was active, the previous item is activated.
      // This can cause a duplicate to be added to history if you just came from that item.
      var history = this.get('history');

      if (history[0] !== currentActiveItem.get('id')) {
        history.unshift(currentActiveItem.get('id'));
        this.save('history', history);
      }
    }

    return nextItem;
    /* jshint ignore:end */
  },

  activatePrevious: function() {
    var previousStreamItem = this.getPrevious();

    // Repeated videos are already active. Trigger a 'change:active' event to keep the UI up-to-date.
    if (previousStreamItem.get('active')) {
      previousStreamItem.trigger('change:active', previousStreamItem, true);
    } else {
      // Remove the entry from history when activating the previous item.
      var history = this.get('history');
      history.shift();
      this.save('history', history);

      previousStreamItem.save({active: true});
    }
  },

  // Return the previous item or null without affecting the history.
  getPrevious: function() {
    /* jshint ignore:start */
    var previousStreamItem = null;
    var history = this.get('history');
    var items = this.get('items');

    if (history.length > 0) {
      previousStreamItem = items.get(history[0]);
    }

    // If nothing found by history -- rely on settings
    if (_.isNull(previousStreamItem)) {
      var shuffleEnabled = this.get('shuffleButton').get('enabled');
      var repeatButtonState = this.get('repeatButton').get('state');

      if (repeatButtonState === RepeatButtonState.RepeatVideo) {
        // If repeating a single video just return whichever video is already currently active.
        previousStreamItem = items.getActiveItem() || null;
      } else if (shuffleEnabled) {
        // If shuffle is enabled and there's nothing in history -- grab a random video which hasn't been played recently.
        previousStreamItem = _.sample(items.getNotPlayedRecently()) || null;
      } else {
        // Activate the previous item by index. Potentially loop around to the back.
        var activeItemIndex = items.indexOf(items.getActiveItem());

        if (activeItemIndex === 0) {
          if (repeatButtonState === RepeatButtonState.RepeatAll) {
            previousStreamItem = items.last() || null;
          }
        } else {
          previousStreamItem = items.at(activeItemIndex - 1) || null;
        }
      }
    }

    return previousStreamItem;
    /* jshint ignore:end */
  },

  // A StreamItem's related video information is used when radio mode is enabled to allow users to discover new videos.
  _onItemsAdd: function(model) {
    this._ensureHasRelatedVideos(model);
  },

  _onGetRelatedVideosSuccess: function(model, relatedVideos) {
    // The model could have been removed from the collection while the request was still in flight.
    // If this happened, just discard the data instead of trying to update the model.
    if (this.get('items').get(model)) {
      model.get('relatedVideos').reset(relatedVideos.models);
      model.save();
    }
  },

  _onItemsRemove: function(model, collection, options) {
    var history = this.get('history');
    history = _.without(history, model.get('id'));
    this.save('history', history);

    var isEmpty = collection.isEmpty();

    if (model.get('active') && !isEmpty) {
      this.activateNext(options.index);
    }

    if (isEmpty) {
      this._cleanupOnItemsEmpty();
    }
  },

  _onItemsReset: function(collection) {
    this.save('history', []);

    var isEmpty = collection.isEmpty();
    if (isEmpty) {
      this._cleanupOnItemsEmpty();
    } else {
      this.set('activeItem', collection.getActiveItem());
    }
  },

  _onItemsChangeActive: function(model, active) {
    if (active) {
      this.set('activeItem', model);
      this._loadActiveItem(model);
    }
  },

  _onPlayerChangeState: function(model, state) {
    // It's important to ensure that the Stream is still in a valid state when the player change's state
    // because the player's methods are asynchronous.
    // The user could've removed a video from the stream after the player emitted an event.
    if (!this.get('items').isEmpty()) {
      var previousState = this.get('player').get('previousState');
      // YouTube triggers an 'Ended' event when seeking to the end of a video.
      // Skipping to the next video when not playing is undesired.
      var wasPlaying = previousState === PlayerState.Playing || previousState === PlayerState.Buffering;

      if (state === PlayerState.Ended && wasPlaying) {
        model.set('playOnActivate', true);
        var nextItem = this.activateNext();

        if (_.isNull(nextItem)) {
          model.set('playOnActivate', false);
        }
      } else if (state === PlayerState.Playing) {
        // Only display notifications if the foreground isn't active -- either through the extension popup or as a URL tab
        this.get('items').showActiveNotification();
      }
    }
  },

  _onPlayerYouTubeError: function(model, youTubeError) {
    if (this.get('items').length === 0) {
      var error = new Error('Error ' + youTubeError + ' happened while StreamItems was empty.');
      StreamusBG.channels.error.commands.trigger('log:error', error);
    }
  },

  _loadActiveItem: function(activeItem) {
    this.get('player').activateVideo(activeItem.get('video'));
  },

  _cleanupOnItemsEmpty: function() {
    this.set('activeItem', null);
    this.get('player').stop();
  },

  // Items fetched from localStorage may not have their relatedVideos loaded.
  // This can happen for various reasons: The JSON in localStorage is out of date,
  // an XHR to YouTube failed, etc. So, try loading relatedVideos if missing.
  _ensureHasRelatedVideos: function(streamItem) {
    if (streamItem.get('relatedVideos').length === 0) {
      this.get('relatedVideosManager').getRelatedVideos({
        videoId: streamItem.get('video').get('id'),
        success: this._onGetRelatedVideosSuccess.bind(this, streamItem)
      });
    }
  }
});

export default Stream;