//  Playlist holds a collection of PlaylistItems as well as properties pertaining to a playlist.
//  Provides methods to work with PlaylistItems such as getting, removing, updating, etc..
define([
    'background/collection/playlistItems',
    'background/model/playlistItem',
    'background/model/settings',
    'background/model/shareCode'
], function (PlaylistItems, PlaylistItem, Settings, ShareCode) {
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
                //  This is count and total duration of all playlistItem sources.
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

            var items = this.get('items');

            //  Need to convert items array to Backbone.Collection
            if (!(items instanceof Backbone.Collection)) {
                items = new PlaylistItems(items, {
                    playlistId: this.get('id')
                });
                
                //  Silent because items is just being properly set.
                this.set('items', items, { silent: true });
            }

            this.on('change:title', function (model, title) {

                //  TODO: In the future, turn this into a .save({ patch: true } once I figure out how to properly merge updates into the server.
                $.ajax({
                    url: Settings.get('serverURL') + 'Playlist/UpdateTitle',
                    type: 'PATCH',
                    data: {
                        id: model.get('id'),
                        title: title
                    }
                });
                
            });

            this.listenTo(this.get('items'), 'add reset remove', this.setDisplayInfo);
            this.setDisplayInfo();
        },
        
        setDisplayInfo: function () {
            var sources = this.get('items').pluck('source');
            var sourceDurations = _.invoke(sources, 'get', 'duration');

            var sumDurations = _.reduce(sourceDurations, function (memo, duration) {
                return memo + duration;
            }, 0);

            //  TODO: i18n video vs song
            var videoString = sources.length === 1 ? chrome.i18n.getMessage('video') : chrome.i18n.getMessage('videos');

            var prettyTime;
            var timeInMinutes = Math.floor(sumDurations / 60);
            
            //  Print the total duration of content in minutes unless there is 3+ hours, then just print hours.
            if (timeInMinutes === 1) {
                prettyTime = timeInMinutes + ' ' + chrome.i18n.getMessage('minute');
            }
            //  3 days
            else if (timeInMinutes > 4320) {
                prettyTime = Math.floor(timeInMinutes / 1440) + ' ' + chrome.i18n.getMessage('days');
            }
            //  3 hours
            else if (timeInMinutes > 180) {
                prettyTime = Math.floor(timeInMinutes / 60) + ' ' + chrome.i18n.getMessage('hours');
            } else {
                prettyTime = timeInMinutes + ' ' + chrome.i18n.getMessage('minutes');
            }

            var displayInfo = sources.length + ' ' + videoString + ', ' + prettyTime;

            this.set('displayInfo', displayInfo);
        },
        
        addBySource: function (source, callback) {

            var playlistItem = new PlaylistItem({
                playlistId: this.get('id'),
                source: source
            });

            this.get('items').savePlaylistItem(playlistItem, callback);
        },
        
        addBySourceAtIndex: function (source, index, callback) {

            var sequence = this.get('items').getSequenceFromIndex(index);

            var playlistItem = new PlaylistItem({
                playlistId: this.get('id'),
                source: source,
                sequence: sequence
            });

            this.get('items').savePlaylistItem(playlistItem, callback);
        },
        
        //  TODO: This needs to be kept DRY with the other methods in this object.
        addBySourcesStartingAtIndex: function (sources, index, callback) {
            console.log("im here");
            var itemsToSave = new PlaylistItems([], {
                playlistId: this.get('id')
            });

            var playlistItems = this.get('items');
            
            var initialSequence = playlistItems.getSequenceFromIndex(index);

            _.each(sources, function (source) {

                //  TODO: Sequence is incorrect here after the first item since I'm not adding models until after saving. FIX!
                var sequence = initialSequence;

                console.log("index and sequence", index, sequence);

                var playlistItem = new PlaylistItem({
                    playlistId: itemsToSave.get('playlistId'),
                    source: source,
                    sequence: sequence
                });
                
                itemsToSave.push(playlistItem);
                index++;
            });

            itemsToSave.save({}, {
                success: function () {

                    //  TODO: Why is this .models and not just itemsToSave?
                    playlistItems.add(itemsToSave.models);

                    if (callback) {
                        callback();
                    }

                }
            });
        },
            
        addBySources: function (sources, callback) {

            //  Defer to appropriate method if called with a single source.
            if (sources.length === 1) {
                return this.addBySource(sources[0], callback);
            }
            
            var itemsToSave = new PlaylistItems([], {
                playlistId: this.get('id')
            });

            var playlistItems = this.get('items');
            
            _.each(sources, function (source) {
                if (!playlistItems.sourceAlreadyExists(source)) {
                    var playlistItem = new PlaylistItem({
                        playlistId: itemsToSave.get('playlistId'),
                        source: source
                    });

                    itemsToSave.push(playlistItem);
                }
            });

            itemsToSave.save({}, {
                success: function () {
                    //  TODO: Why is this .models and not just itemsToSave?
                    playlistItems.add(itemsToSave.models);

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
                data: {
                    playlistId: self.get('id')
                },
                success: function (shareCodeJson) {
                    var shareCode = new ShareCode(shareCodeJson);
                    callback(shareCode);
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