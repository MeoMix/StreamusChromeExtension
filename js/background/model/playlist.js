//  Playlist holds a collection of PlaylistItems as well as properties pertaining to a playlist.
//  Provides methods to work with PlaylistItems such as getting, removing, updating, etc..
define([
    'playlistItems',
    'playlistItem',
    'settings',
    'video',
    'repeatButtonState',
    'shareCode',
    'shareableEntityType'
], function (PlaylistItems, PlaylistItem, Settings, Video, RepeatButtonState, ShareCode, ShareableEntityType) {
    'use strict';

    var playlistModel = Backbone.Model.extend({
        defaults: function() {
            return {
                id: null,
                folderId: null,
                title: chrome.i18n.getMessage("newPlaylist"),
                items: new PlaylistItems(),
                dataSource: null,
                dataSourceLoaded: false,
                //  This is videos length and total duration of all videos
                displayInfo: ''
            };
        },

        urlRoot: Settings.get('serverURL') + 'Playlist/',
            
        //  Convert data which is sent from the server back to a proper Backbone.Model.
        //  Need to recreate submodels as Backbone.Models else they will just be regular Objects.
        parse: function (playlistDto) {

            //  Convert C# Guid.Empty into BackboneJS null
            for (var key in playlistDto) {
                if (playlistDto.hasOwnProperty(key) && playlistDto[key] == '00000000-0000-0000-0000-000000000000') {
                    playlistDto[key] = null;
                }
            }

            if (playlistDto.items.length > 0) {
                //  Reset will load the server's response into items as a Backbone.Collection
                this.get('items').reset(playlistDto.items);

            } else {
                this.set('items', new PlaylistItems());
            }
                
            // Remove so parse doesn't set and overwrite instance after parse returns.
            delete playlistDto.items;

            this.setDisplayInfo();

            return playlistDto;
        },
        initialize: function () {
            var self = this;
            var items = this.get('items');

            //  Need to convert items array to Backbone.Collection
            if (!(items instanceof Backbone.Collection)) {
                items = new PlaylistItems(items);
                //  Silent because items is just being properly set.
                this.set('items', items, { silent: true });
            }

            //  Debounce because I want automatic typing but no reason to spam server with saves.
            this.on('change:title', _.debounce(function (model, title) {

                $.ajax({
                    url: Settings.get('serverURL') + 'Playlist/UpdateTitle',
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        playlistId: model.get('id'),
                        title: title
                    },
                    success: function () {
                        self.trigger('sync');
                    },
                    error: function (error) {
                        console.error("Error saving title", error);
                    }
                });
                
            }, 2000));
                
            this.listenTo(this.get('items'), 'add addMultiple empty remove', this.setDisplayInfo);
            this.setDisplayInfo();

            this.listenTo(this.get('items'), 'sync', function() {
                this.trigger('sync');
            });
        },
        
        setDisplayInfo: function () {

            var videos = this.get('items').pluck('video');
            var videoDurations = _.invoke(videos, 'get', 'duration');

            var sumVideoDurations = _.reduce(videoDurations, function (memo, duration) {
                return memo + duration;
            }, 0);

            var videoString = videos.length === 1 ? chrome.i18n.getMessage('video') : chrome.i18n.getMessage('videos');

            var prettyVideoTime;
            var videoTimeInMinutes = Math.floor(sumVideoDurations / 60);
            
            //  Print the total duration of content in minutes unless there is 3+ hours, then just print hours.
            if (videoTimeInMinutes === 1) {
                prettyVideoTime = videoTimeInMinutes + ' ' + chrome.i18n.getMessage('minute');
            }
            //  3 days
            else if (videoTimeInMinutes > 4320) {
                prettyVideoTime = Math.floor(videoTimeInMinutes / 1440) + ' ' + chrome.i18n.getMessage('days');
            }
            //  3 hours
            else if (videoTimeInMinutes > 180) {
                prettyVideoTime = Math.floor(videoTimeInMinutes / 60) + ' ' + chrome.i18n.getMessage('hours');
            } else {
                prettyVideoTime = videoTimeInMinutes + ' ' + chrome.i18n.getMessage('minutes');
            }

            var displayInfo = videos.length + ' ' + videoString + ', ' + prettyVideoTime;

            this.set('displayInfo', displayInfo);
        },
        
        //  Return what sequence number would be necessary to be at the given index
        getSequenceFromIndex: function (index) {

            var sequence;

            var sequenceIncrement = 10000;
            var playlistItems = this.get('items');

            if (playlistItems.length === 0) {
                sequence = sequenceIncrement;
            }
            else if (index === playlistItems.length) {
                sequence = playlistItems.at(playlistItems.length - 1).get('sequence') + sequenceIncrement;
            } else {
                var previousIndex = index - 1;

                var highSequence = playlistItems.at(index).get('sequence');

                var lowSequence = 0;
                var previousItem = playlistItems.at(previousIndex);

                if (previousItem) {
                    lowSequence = previousItem.get('sequence');
                }

                sequence = (highSequence + lowSequence) / 2;
            }
  
            return sequence;
        },
        
        moveItemToIndex: function(playlistItemId, index) {
            var sequence = this.getSequenceFromIndex(index);

            var item = this.get('items').get(playlistItemId);

            item.set('sequence', sequence);
            item.save();
            //  TODO: I'd like to make sure I have to call sort.
            this.get('items').sort();
        },
        
        addByVideoAtIndex: function (video, index, callback) {

            var sequence = this.getSequenceFromIndex(index);

            var playlistItem = new PlaylistItem({
                playlistId: this.get('id'),
                video: video,
                sequence: sequence
            });

            var self = this;
            this.savePlaylistItem(playlistItem, function() {
                self.get('items').sort();
                
                if (callback) {
                    callback();
                }
            });

        },
        
        addByVideo: function (video, callback) {

            var playlistItem = new PlaylistItem({
                playlistId: this.get('id'),
                video: video
            });

            this.savePlaylistItem(playlistItem, callback);

        },
        
        savePlaylistItem: function(playlistItem, callback) {
            var self = this;

            //  Save the playlistItem, but push after version from server because the ID will have changed.
            playlistItem.save({}, {

                success: function () {
                    console.log("Pushing playlistItem:", playlistItem);
                    self.get('items').add(playlistItem);
                    //  TODO: Consider just incrementing displayInfo instead of re-calculating if it becomes too expensive... should be ok though
                    self.setDisplayInfo();

                    if (callback) {
                        callback(playlistItem);
                    }

                },

                error: function (error) {
                    console.error(error);
                }

            });
        },
            
        addByVideos: function (videos, callback) {
            
            console.log("Calling addItems with videos:", videos);

            //  If this method is lazily/erroneously called with a single item in the array -- call addItem instead of addItems.
            if (videos.length === 1) {
                return this.addByVideo(videos[0], callback);
            }
            
            var self = this;
            var itemsToSave = new PlaylistItems();
            
            _.each(videos, function (video) {

                var playlistItem = new PlaylistItem({
                    playlistId: self.get('id'),
                    video: video
                });

                itemsToSave.push(playlistItem);
            });

            console.log("Saving some videos", videos.length);

            itemsToSave.save({}, {
                success: function () {

                    self.get('items').add(itemsToSave.models);
                    self.setDisplayInfo();
   
                    if (callback) {
                        callback();
                    }

                },
                error: function (error) {
                    console.error("There was an issue saving" + self.get('title'), error);
                }
            });
        },
            
        getShareCode: function(callback) {
            var self = this;
            
            $.ajax({
                url: Settings.get('serverURL') + 'ShareCode/GetShareCode',
                type: 'GET',
                dataType: 'json',
                data: {
                    entityType: ShareableEntityType.PLAYLIST,
                    entityId: self.get('id')
                },
                success: function (shareCodeJson) {
                    var shareCode = new ShareCode(shareCodeJson);
                    callback(shareCode);
                    self.trigger('sync');
                },
                error: function (error) {
                    console.error("Error retrieving share code", error, error.message);
                }
            });

        },

        getPlaylistItemById: function (playlistItemId) {
            return this.get('items').findWhere({ id: playlistItemId });
        }
    });

    return function (config) {
        var playlist = new playlistModel(config);
            
        return playlist;
    };
});