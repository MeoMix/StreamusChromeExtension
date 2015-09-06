import {Collection} from 'backbone';
import SyncActionType from 'background/enum/syncActionType';
import CollectionSequence from 'background/mixin/collectionSequence';
import Playlist from 'background/model/playlist';
import YouTubeV3API from 'background/model/youTubeV3API';
import ListItemType from 'common/enum/listItemType';
import DataSource from 'background/model/dataSource';
import Utility from 'common/utility';
import LayoutType from 'common/enum/layoutType';

var Playlists = Collection.extend({
  model: Playlist,
  userId: null,
  mixins: [CollectionSequence],

  url: function() {
    return StreamusBG.serverUrl + 'Playlist/';
  },

  initialize: function(models, options) {
    this.userId = options ? options.userId : this.userId;

    chrome.runtime.onMessage.addListener(this._onChromeRuntimeMessage.bind(this));
    this.on('add', this._onAdd);
    this.on('remove', this._onRemove);
    this.on('change:active', this._onChangeActive);
    this.on('change:sequence', this._onChangeSequence);
    this.listenTo(StreamusBG.settings, 'change:layoutType', this._onSettingsChangeLayoutType);
  },

  getActivePlaylist: function() {
    return this.findWhere({
      active: true
    });
  },

  // Expects options: { playlistId, success, error };
  copyPlaylist: function(options) {
    $.ajax({
      type: 'POST',
      url: StreamusBG.serverUrl + 'Playlist/Copy',
      data: {
        playlistId: options.playlistId,
        userId: this.userId
      },
      success: function(playlistDto) {
        // Add and convert back from JSON to Backbone object.
        var playlist = this.add(playlistDto);
        playlist.set('active', true);
        options.success(playlist);
      }.bind(this),
      error: options.error
    });
  },

  addPlaylistWithVideos: function(playlistTitle, videos) {
    videos = videos instanceof Collection ? videos.models : _.isArray(videos) ? videos : [videos];
    var playlistItems = _.map(videos, function(video) {
      return {
        title: video.get('title'),
        video: video
      };
    });

    this.create({
      title: playlistTitle,
      userId: this.userId,
      // Playlists are always added at the end
      sequence: this.getSequenceFromIndex(this.length),
      items: playlistItems
    }, {
      success: function(playlist) {
        // It's important to call set instead of providing value in create in order to de-activate other active playlist.
        playlist.set('active', true);
      },
      error: function(model) {
        model.trigger('createError');
      }
    });
  },

  addPlaylistByDataSource: function(playlistTitle, dataSource) {
    this.create({
      title: playlistTitle,
      userId: this.userId,
      // Playlists are always added at the end
      sequence: this.getSequenceFromIndex(this.length),
      dataSource: dataSource,
      // If a playlist is being created with a YouTube Playlist URL then that URL will need to be imported into the playlist.
      dataSourceLoaded: !dataSource.isYouTubePlaylist()
    }, {
      success: function(playlist) {
        // It's important to call set instead of providing value in create in order to de-activate other active playlist.
        playlist.set('active', true);

        if (!playlist.get('dataSourceLoaded')) {
          playlist.loadDataSource();
        }
      },
      error: function(model) {
        model.trigger('createError');
      }
    });
  },

  loadStoredState: function() {
    this._ensureActivePlaylist();
    this._setCanDelete(this.length > 1);
  },

  _deactivateAllExcept: function(changedPlaylist) {
    this.each(function(playlist) {
      if (playlist !== changedPlaylist) {
        playlist.set('active', false);
      }
    });
  },

  _setCanDelete: function(canDelete) {
    // Playlists can only be deleted if there's >1 playlist existing because I don't want to leave the user with 0 playlists.
    this.invoke('set', 'canDelete', canDelete);
  },

  _onChangeSequence: function(model) {
    // Let the collection adjust the model's index after its sequence changes
    _.defer(function() {
      model.emitYouTubeTabUpdateEvent({
        id: model.get('id'),
        index: this.indexOf(model)
      });
    }.bind(this));
  },

  _onChromeRuntimeMessage: function(request, sender, sendResponse) {
    var sendAsynchronousResponse = false;

    switch (request.method) {
      case 'getPlaylists':
        sendResponse({
          playlists: this
        });
        break;
      case 'addVideoByUrlToPlaylist':
        var dataSource = new DataSource({
          url: request.url
        });

        dataSource.parseUrl({
          success: function() {
            YouTubeV3API.getVideo({
              videoId: dataSource.get('entityId'),
              success: function(video) {
                var playlistItems = this.get(request.playlistId).get('items');

                playlistItems.addVideos(video, {
                  success: function() {
                    StreamusBG.channels.backgroundNotification.commands.trigger('show:notification', {
                      title: chrome.i18n.getMessage('videoAdded'),
                      message: video.get('title')
                    });

                    sendResponse({
                      result: 'success'
                    });
                  },
                  error: this._notifyChromeRuntimeMessageError.bind(this, sendResponse)
                });
              }.bind(this),
              error: this._notifyChromeRuntimeMessageError.bind(this, sendResponse)
            });
          }.bind(this),
          error: this._notifyChromeRuntimeMessageError.bind(this, sendResponse)
        });

        sendAsynchronousResponse = true;
        break;
    }

    // sendResponse becomes invalid after returning you return true to indicate a response will be sent asynchronously.
    return sendAsynchronousResponse;
  },

  _onChangeActive: function(changedPlaylist, active) {
    // Ensure only one playlist is active at a time by de-activating all other active playlists.
    // Purposefully don't remove activePlaylistId because it's useful for restoring state when
    // changing from Layout.FullPane w/ Stream visible to SplitPane.
    if (active) {
      this._deactivateAllExcept(changedPlaylist);
      localStorage.setItem('activePlaylistId', changedPlaylist.get('id'));
    }
  },

  _onAdd: function(addedPlaylist, collection, options) {
    // Add events fire while the playlist is savings so that the UI can show a saving indicator.
    // Wait until the playlist has successfully saved before announcing it was created.
    if (addedPlaylist.isNew()) {
      this.listenToOnce(addedPlaylist, 'createError', function() {
        this.stopListening(addedPlaylist, 'change:id');
      });

      this.listenToOnce(addedPlaylist, 'change:id', function() {
        this.stopListening(addedPlaylist, 'createError');
        this._onCreateSuccess(addedPlaylist, options);
      });
    } else {
      this._onCreateSuccess(addedPlaylist, options);
    }
  },

  _onCreateSuccess: function(addedPlaylist) {
    // Notify all open YouTube tabs that a playlist has been added.
    StreamusBG.channels.tab.commands.trigger('notify:youTube', {
      event: SyncActionType.Added,
      type: ListItemType.Playlist,
      data: {
        id: addedPlaylist.get('id'),
        title: addedPlaylist.get('title'),
        active: addedPlaylist.get('active')
      }
    });

    var playlistTitle = Utility.truncateString(addedPlaylist.get('title'), 30);
    var itemCount = addedPlaylist.get('items').length;
    var notificationMessage;

    if (itemCount > 0) {
      var messageKey = itemCount === 1 ? 'playlistCreatedWithVideo' : 'playlistCreatedWithVideos';
      notificationMessage = chrome.i18n.getMessage(messageKey, [playlistTitle, itemCount]);
    } else {
      notificationMessage = chrome.i18n.getMessage('playlistCreated', [playlistTitle]);
    }

    StreamusBG.channels.notification.commands.trigger('show:notification', {
      message: notificationMessage
    });

    this._setCanDelete(this.length > 1);
  },

  // Whenever a playlist is removed, if it was selected, select the next playlist.
  _onRemove: function(removedPlaylist, collection, options) {
    if (removedPlaylist.get('active')) {
      // Clear local storage of the active playlist if it gets removed.
      localStorage.removeItem('activePlaylistId');
      // If the index of the item removed was the last one in the list, activate previous.
      var index = options.index === this.length ? options.index - 1 : options.index;
      this.at(index).set('active', true);
    }

    if (this.length === 1) {
      this._setCanDelete(false);
    }

    // Notify all open YouTube tabs that a playlist has been added.
    StreamusBG.channels.tab.commands.trigger('notify:youTube', {
      event: SyncActionType.Removed,
      type: ListItemType.Playlist,
      data: {
        id: removedPlaylist.get('id')
      }
    });
  },

  _onSettingsChangeLayoutType: function(settings, layoutType) {
    if (layoutType === LayoutType.SplitPane) {
      this._ensureActivePlaylist();
    }
  },

  _ensureActivePlaylist: function() {
    var activePlaylistId = localStorage.getItem('activePlaylistId');
    var playlist = this.get(activePlaylistId);

    // Safer to check if playlist is undefined rather than activePlaylistId is null.
    if (_.isUndefined(playlist)) {
      // Ensure that there's an active playlist if an active playlist needs to be shown.
      if (this.length > 0 && StreamusBG.settings.get('layoutType') === LayoutType.SplitPane) {
        this.at(0).set('active', true);
      }
    } else {
      playlist.set('active', true);
    }
  },

  _notifyChromeRuntimeMessageError: function(sendResponse) {
    StreamusBG.channels.backgroundNotification.commands.trigger('show:notification', {
      title: chrome.i18n.getMessage('errorEncountered')
    });

    sendResponse({
      result: 'error'
    });
  }
});

export default Playlists;