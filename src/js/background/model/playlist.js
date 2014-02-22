//  Playlist holds a collection of PlaylistItems as well as properties pertaining to a playlist.
//  Provides methods to work with PlaylistItems such as getting, removing, updating, etc..
define([
    'background/collection/playlistItems',
    'background/model/playlistItem',
    'background/model/settings',
    'background/model/video',
    'background/model/shareCode',
    'common/enum/repeatButtonState',
    'common/enum/shareableEntityType'
], function (PlaylistItems, PlaylistItem, Settings, Video, ShareCode, RepeatButtonState, ShareableEntityType) {
    'use strict';

    var Playlist = Backbone.Model.extend({
        defaults: function () {

            return {
                id: null,
                userId: null,
                title: chrome.i18n.getMessage('newPlaylist'),
                //  This is set to a PlaylistItemsCollection once the playlist has an ID.
                items: null,
                dataSource: null,
                dataSourceLoaded: false,
                active: false,
                //  This is videos length and total duration of all videos
                displayInfo: '',
                sequence: -1
            };
        },

        urlRoot: Settings.get('serverURL') + 'Playlist/',
            
        //  Convert data which is sent from the server back to a proper Backbone.Model.
        //  Need to recreate submodels as Backbone.Models else they will just be regular Objects.
        parse: function (playlistDto) {

            //  Convert C# Guid.Empty into BackboneJS null
            for (var key in playlistDto) {
                if (playlistDto.hasOwnProperty(key) && playlistDto[key] === '00000000-0000-0000-0000-000000000000') {
                    playlistDto[key] = null;
                }
            }
            
            //  Reset will load the server's response into items as a Backbone.Collection
            this.get('items').reset(playlistDto.items);

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
                items = new PlaylistItems(items, {
                    playlistId: this.get('id')
                });
                
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

            this.listenTo(this.get('items'), 'add reset remove', this.setDisplayInfo);
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
        
        addByVideo: function (video, callback) {

            var playlistItem = new PlaylistItem({
                playlistId: this.get('id'),
                video: video
            });

            this.get('items').savePlaylistItem(playlistItem, callback);
        },
        
        addByVideoAtIndex: function (video, index, callback) {

            var sequence = this.get('items').getSequenceFromIndex(index);

            var playlistItem = new PlaylistItem({
                playlistId: this.get('id'),
                video: video,
                sequence: sequence
            });

            this.get('items').savePlaylistItem(playlistItem, callback);
        },
            
        addByVideos: function (videos, callback) {

            //  If this method is lazily/erroneously called with a single item in the array -- call addItem instead of addItems.
            if (videos.length === 1) {
                return this.addByVideo(videos[0], callback);
            }
            
            var self = this;
            var itemsToSave = new PlaylistItems([], {
                playlistId: this.get('id')
            });
            
            _.each(videos, function (video) {
                
                if (!self.get('items').videoAlreadyExists(video)) {
                    var playlistItem = new PlaylistItem({
                        playlistId: self.get('id'),
                        video: video
                    });

                    itemsToSave.push(playlistItem);
                }
                
            });

            itemsToSave.save({}, {
                success: function () {

                    //  TODO: Why is this .models and not just itemsToSave?
                    self.get('items').add(itemsToSave.models);

                    if (callback) {
                        callback();
                    }

                }
            });
        },
            
        getShareCode: function(callback) {
            var self = this;
            
            $.ajax({
                url: Settings.get('serverURL') + 'ShareCode/GetShareCode',
                dataType: 'json',
                data: {
                    entityType: ShareableEntityType.Playlist,
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

    return Playlist;
});