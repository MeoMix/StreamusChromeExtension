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
                firstItemId: null,
                nextPlaylistId: null,
                previousPlaylistId: null,
                items: new PlaylistItems(),
                dataSource: null,
                dataSourceLoaded: false,
                displayInfo: '' //  This is videos length and total duration of all videos
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
                
            this.on('change:firstItemId', function (model, firstItemId) {

                $.ajax({
                    url: Settings.get('serverURL') + 'Playlist/UpdateFirstItem',
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        playlistId: model.get('id'),
                        firstItemId: firstItemId
                    },
                    success: function() {
                        self.trigger('sync');
                    },
                    error: function (error) {
                        console.error("Error saving firstItemId", error, error.message);
                    }
                });
                    
            });

            this.listenTo(this.get('items'), 'add addMultiple empty', this.setDisplayInfo);
            this.setDisplayInfo();

            this.listenTo(this.get('items'), 'sync', function() {
                this.trigger('sync');
            });

            this.listenTo(this.get('items'), 'remove', function (removedPlaylistItem) {
                var playlistItems = self.get('items');

                if (playlistItems.length > 0) {
                    //  Update linked list pointers
                    var previousItem = playlistItems.get(removedPlaylistItem.get('previousItemId'));
                    var nextItem = playlistItems.get(removedPlaylistItem.get('nextItemId'));

                    //  Remove the item from linked list.
                    previousItem.set('nextItemId', nextItem.get('id'));
                    nextItem.set('previousItemId', previousItem.get('id'));

                    //  Update firstItem if it was removed
                    if (self.get('firstItemId') === removedPlaylistItem.get('id')) {
                        self.set('firstItemId', removedPlaylistItem.get('nextItemId'));
                    }

                } else {
                    self.set('firstItemId', '00000000-0000-0000-0000-000000000000');
                }

                console.log("removed an item");

                self.setDisplayInfo();
            });
        },
        
        //  TODO: Not sure where this is being referenced, but introducing setNewDisplayInfo for now
        setDisplayInfo: function () {
            console.log("Setting display info");
            var videos = this.get('items').pluck('video');
            var videoDurations = _.invoke(videos, 'get', 'duration');

            var sumVideoDurations = _.reduce(videoDurations, function (memo, duration) {
                return memo + duration;
            }, 0);

            var videoString = videos.length === 1 ? 'video' : 'videos';

            var prettyVideoTime = '';
            var videoTimeInMinutes = Math.floor(sumVideoDurations / 60);
            
            //  Print the total duration of content in minutes unless there is 3+ hours, then just print hours.
            if (videoTimeInMinutes === 1) {
                prettyVideoTime = videoTimeInMinutes + ' minute';
            }
            else if (videoTimeInMinutes > 180) {
                prettyVideoTime = Math.floor(videoTimeInMinutes / 60) + ' hours';
            } else {
                prettyVideoTime = videoTimeInMinutes + ' minutes';
            }

            var displayInfo = videos.length + ' ' + videoString + ', ' + prettyVideoTime;

            console.log("Display info and old:", displayInfo, this.get('displayInfo'));

            this.set('displayInfo', displayInfo);
        },
            
        //  This is generally called from the foreground to not couple the Video object with the foreground.
        addByVideoInformation: function (videoInformation) {
            console.log("inside addByVideoInformation");
            //  Support adding an array of videoInformation, too.
            if (_.isArray(videoInformation)) {
                console.log("im an ARRAY!");
                var videos = _.map(videoInformation, function (info) {
                    return new Video({
                        videoInformation: info
                    });
                });

                this.addItems(videos);
            } else {
                
                var video = new Video({
                    videoInformation: videoInformation
                });

                this.addItem(video);
                console.log("AddedItem!", video);
            }

        },

        addItem: function (video, callback) {

            var playlistItem = new PlaylistItem({
                playlistId: this.get('id'),
                video: video
            });
                
            var self = this;

            //  Save the playlistItem, but push after version from server because the ID will have changed.
            playlistItem.save({}, {
                    
                success: function () {

                    //  Update client-side pointers for other items which are affected. The saved playlistItem updates implicitly.
                    var playlistItemId = playlistItem.get('id');
                    var currentItems = self.get('items');
                        
                    if (currentItems.length === 0) {
                        self.set('firstItemId', playlistItemId);
                    } else {
                        var firstItem = currentItems.get(self.get('firstItemId'));
                        var lastItem = currentItems.get(firstItem.get('previousItemId'));
                            
                        lastItem.set('nextItemId', playlistItemId);
                        firstItem.set('previousItemId', playlistItemId);
                    }

                    self.get('items').push(playlistItem);
                    //  TODO: Consider just incrementing displayInfo instead of re-calculating if it becomes too expensive... should be ok though
                    self.setDisplayInfo();
  
                    if (callback) {
                        callback(playlistItem);
                    }

                },
                    
                error: function(error) {
                    console.error(error);
                }
                    
            });
        },
            
        addItems: function (videos, callback) {
            
            console.log("Calling addItems with videos:", videos);

            //  If this method is lazily/erroneously called with a single item in the array -- call addItem instead of addItems.
            if (videos.length === 1) {
                return this.addItem(videos[0], callback);
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
                        
                    var currentItems = self.get('items');

                    //  After a bulk save the following properties are still out of date on the playlist.
                    if (currentItems.length === 0) {
                        //  Silent because the data just came from the sever
                        self.set('firstItemId', itemsToSave.at(0).get('id'), { silent: true });
                    } else {

                        var firstItem = currentItems.get(self.get('firstItemId'));
                        var lastItem = currentItems.get(firstItem.get('previousItemId'));
                        
                        lastItem.set('nextItemId', itemsToSave.at(0).get('id'));
                        firstItem.set('previousItemId', itemsToSave.at(itemsToSave.length - 1).get('id'));
                    }

                    console.log("Adding models");
                    
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
            
        moveItem: function (movedItemId, nextItemId) {
                
            var movedItem = this.get('items').get(movedItemId);
                
            //  The previous and next items of the movedItem's original position. Need to update these pointers.
            var movedPreviousItem = this.get('items').get(movedItem.get('previousItemId'));
            var movedNextItem = this.get('items').get(movedItem.get('nextItemId'));
                
            movedPreviousItem.set('nextItemId', movedNextItem.get('id'));
            movedNextItem.set('previousItemId', movedPreviousItem.get('id'));
                
            //  The item right in front of movedItem which got 'bumped forward 1' after the move.
            var nextItem = this.get('items').get(nextItemId);

            var previousItemId = nextItem.get('previousItemId');
            //  The item right behind movedItem which stayed in the same position.
            var previousItem = this.get('items').get(nextItem.get('previousItemId'));

            //  Fix the movedItem's pointers.
            nextItem.set('previousItemId', movedItemId);
            movedItem.set('nextItemId', nextItemId);
            movedItem.set('previousItemId', previousItemId);
            previousItem.set('nextItemId', movedItemId);

            //  If bumped forward the firstItem, update to new firstItemId.
            if (nextItemId == this.get('firstItemId')) {
                //  This saves automatically with a triggered event.
                this.set('firstItemId', movedItemId);
            }
                
            //  Save just the items that changed -- don't save the whole playlist because that is too costly for a move.
            var itemsToSave = new PlaylistItems();
            itemsToSave.add(movedItem);
            itemsToSave.add(movedPreviousItem);
            itemsToSave.add(movedNextItem);
            itemsToSave.add(nextItem);
            itemsToSave.add(previousItem);
                
            itemsToSave.save({}, {
                success: function() {
                        
                },
                error: function (error) {
                    console.error(error);
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