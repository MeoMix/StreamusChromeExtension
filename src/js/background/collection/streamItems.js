define([
    'background/collection/multiSelectCollection',
    'background/notifications',
    'background/model/streamItem',
    'background/model/song',
    'background/model/player',
    'background/model/buttons/shuffleButton',
    'background/model/buttons/radioButton',
    'background/model/buttons/repeatButton',
    'common/enum/repeatButtonState',
    'common/enum/playerState',
    'common/model/utility',
    'common/model/youTubeV2API'
], function (MultiSelectCollection, Notifications, StreamItem, Song, Player, ShuffleButton, RadioButton, RepeatButton, RepeatButtonState, PlayerState, Utility, YouTubeV2API) {
    'use strict';
    
    //  If the foreground requests streamItems, don't instantiate -- return existing from the background.
    if (!_.isUndefined(chrome.extension.getBackgroundPage().window.StreamItems)) {
        return chrome.extension.getBackgroundPage().window.StreamItems;
    }

    var StreamItems = MultiSelectCollection.extend({
        model: StreamItem,

        initialize: function () {
            //  TODO: Probably make a stream model instead of extending streamItems
            //  Give StreamItems a history: https://github.com/jashkenas/backbone/issues/1442
            _.extend(this, { history: [] });
            _.extend(this, { bannedSongIdList: [] });

            var self = this;

            this.on('add', function (addedStreamItem) {
                //  Ensure only one streamItem is active at a time by deactivating all other active streamItems.
                if (addedStreamItem.get('active')) {
                    addedStreamItem.trigger('change:active', addedStreamItem, true);
                }

                //  Ensure a streamItem is always active
                if (_.isUndefined(this.getActiveItem())) {
                    addedStreamItem.set('active', true);
                }
            });

            this.on('change:active', function (changedStreamItem, active) {

                //  Ensure only one streamItem is active at a time by deactivating all other active streamItems.
                if (active) {
                    this.deactivateAllExcept(changedStreamItem);

                    var songId = changedStreamItem.get('song').get('id');

                    //  Maintain the state of the player by playing or cueuing based on current player state.
                    var playerState = Player.get('state');

                    //  TODO: Maybe ended here isn't right if they had only 1 item in the playlist and then add another with the first ended.
                    if (playerState === PlayerState.Playing || playerState === PlayerState.Ended) {
                        Player.loadSongById(songId);
                    } else {
                        Player.cueSongById(songId);
                    }
                    
                    this.history.unshift(changedStreamItem);
                }

            });

            this.listenTo(Player, 'change:state', function (model, state) {
                
                if (state === PlayerState.Ended) {
                    this.activateNext();
                }
                else if (state === PlayerState.Playing) {

                    //  Only display notifications if the foreground isn't open.
                    var foreground = chrome.extension.getViews({ type: "popup" });

                    if (foreground.length === 0) {

                        this.showActiveNotification();
                    }
                }

            });

            this.on('remove reset', function () {
                if (this.length === 0) {
                    Player.stop();
                }
            });

            this.on('remove', function (removedStreamItem, collection, options) {
                //  If an item is deleted from the stream -- remove it from history, too, because you can't skip back to it.
                var historyIndex = this.history.indexOf(removedStreamItem);
                if (historyIndex > -1) {
                    this.history.splice(historyIndex, 1);
                }

                if (removedStreamItem.get('active') && this.length > 0) {
                    this.activateNext(options.index);
                }
            });

            this.on('change:playedRecently', function() {

                //  When all streamItems have been played recently, reset to not having been played recently.
                //  Allows for de-prioritization of played streamItems during shuffling.
                if (this.where({ playedRecently: true }).length === this.length) {
                    this.each(function(streamItem) {
                        streamItem.set('playedRecently', false);
                    });
                }

            });
            
            //  Beatport can send messages to add stream items and play directly if user has clicked on a button.
            chrome.runtime.onMessage.addListener(function (request) {
                
                switch (request.method) {
                    case 'searchAndStreamByQuery':
                        self.searchAndAddByTitle(request.query, true);
                    break;

                    case 'searchAndStreamByQueries':
                        var queries = request.queries;

                        if (queries.length > 0) {
                            
                            var query = queries.shift();

                            var recursiveShiftTitleAndAdd = function () {
                                
                                if (queries.length > 0) {
                                    query = queries.shift();
                                    self.searchAndAddByTitle(query, false, recursiveShiftTitleAndAdd);
                                }
                                
                            };

                            self.searchAndAddByTitle(query, true, function () {
                                recursiveShiftTitleAndAdd();
                            });
                            
                        }
                    break;
                }

            });
            
            MultiSelectCollection.prototype.initialize.call(this, arguments);

        },
        
        searchAndAddByTitle: function(title, playOnAdd, callback) {
            var self = this;
            
            YouTubeV2API.search({
                text: title,
                maxResults: 10,
                success: function (songInformationList) {

                    if (songInformationList.length === 0) {
                        console.error("Failed to find any songs for:", title);
                    } else {

                        var song = new Song();
                        song.setYouTubeInformation(songInformationList[0]);

                        self.addSongs(song, {
                            playOnAdd: !!playOnAdd
                        });
                    }

                    if (callback) {
                        callback();
                    }
                }
            });
        },
        
        showActiveNotification: function() {
            var activeItem = this.getActiveItem();

            var iconUrl = '';
            var title = 'No active song';
            var message = '';

            if (!_.isUndefined(activeItem)) {
                var activeSongId = activeItem.get('song').get('id');
                iconUrl = 'http://img.youtube.com/vi/' + activeSongId + '/default.jpg';
                title = 'Now Playing';
                message = activeItem.get('title');
            }

            Notifications.showNotification({
                iconUrl: iconUrl,
                title: title,
                message: message
            });
        },
        
        addSongs: function (songs, options) {

            if (!_.isArray(songs)) {
                songs = [songs];
            }

            var playOnAdd = _.isUndefined(options) || _.isUndefined(options.playOnAdd) ? false : options.playOnAdd;
            
            if (playOnAdd) {
                Player.playOnceSongChanges();
            }
            
            //  TODO: It would be nice if this was a bulk-insert, but I don't expect people to drag too many.
            var streamItems = _.map(songs, function (song, iterator) {
                return {
                    song: song,
                    title: song.get('title'),
                    
                    //  Activate and play the first added item if playOnAdd is set to true
                    active: playOnAdd && iterator === 0
                };
            });

            this.add(streamItems, {
                //  TODO: I think this is the proper way of expressing this. Test!
                at: _.isUndefined(options) ? undefined : options.index
            });
        },

        deactivateAllExcept: function(changedStreamItem) {

            this.each(function(streamItem) {

                if (streamItem != changedStreamItem) {
                    streamItem.set('active', false);
                }

            });

        },

        getActiveItem: function () {
            return this.findWhere({ active: true });
        },
        
        //  Take each streamItem's array of related songs, pluck them all out into a collection of arrays
        //  then flatten the arrays into a single array of songs.
        getRelatedSongs: function() {

            //  TODO: Does SoundCloud have related information? I hope so!
            //  Find all streamItem entities which have related song information.
            //  Some might not have information. This is OK. Either YouTube hasn't responded yet or responded with no information. Skip these.
            var streamItemsWithInfo = this.filter(function (streamItem) {
                return streamItem.get('relatedSongInformation') != null;
            });

            //  Create a list of all the related songs from all of the information of stream items.
            var relatedSongs = _.flatten(_.map(streamItemsWithInfo, function (streamItem) {

                return _.map(streamItem.get('relatedSongInformation'), function (relatedSongInformation) {

                    var song = new Song();
                    song.setYouTubeInformation(relatedSongInformation);

                    return song;
                });

            }));

            //  Don't add any songs that are already in the stream.
            var self = this;

            relatedSongs = _.filter(relatedSongs, function (relatedSong) {
                var alreadyExistingItem = self.find(function (streamItem) {

                    var sameSongId = streamItem.get('song').get('id') === relatedSong.get('id');
                    var sameCleanTitle = streamItem.get('song').get('cleanTitle') === relatedSong.get('cleanTitle');

                    var inBanList = _.contains(self.bannedSongIdList, relatedSong.get('id'));

                    return sameSongId || sameCleanTitle || inBanList;
                });

                return alreadyExistingItem == null;
            });

            // Try to filter out 'playlist' songs, but if they all get filtered out then back out of this assumption.
            var tempFilteredRelatedSongs = _.filter(relatedSongs, function (relatedSong) {
                //  assuming things >8m are playlists.
                var isJustOneSong = relatedSong.get('duration') < 480;
                var isNotLive = relatedSong.get('title').toLowerCase().indexOf('live') === -1;

                return isJustOneSong && isNotLive;
            });

            if (tempFilteredRelatedSongs.length !== 0) {
                relatedSongs = tempFilteredRelatedSongs;
            }

            return relatedSongs;
        },

        getRandomRelatedSong: function() {

            var relatedSongs = this.getRelatedSongs();
            var relatedSong = relatedSongs[_.random(relatedSongs.length - 1)] || null;
            
            return relatedSong;
        },
        
        //  If a streamItem which was active is removed, activateNext will have a removedActiveItemIndex provided
        activateNext: function (removedActiveItemIndex) {

            var nextItem = null;

            var shuffleEnabled = ShuffleButton.get('enabled');
            var radioEnabled = RadioButton.get('enabled');
            var repeatButtonState = RepeatButton.get('state');

            //  If removedActiveItemIndex is provided, RepeatButtonState.RepeatSong doesn't matter because the StreamItem was just deleted.
            if (_.isUndefined(removedActiveItemIndex) && repeatButtonState === RepeatButtonState.RepeatSong) {
                var activeItem = this.findWhere({ active: true });
                activeItem.trigger('change:active', activeItem, true);
                nextItem = activeItem;
            } else if (shuffleEnabled) {
                var shuffledItems = _.shuffle(this.where({ playedRecently: false }));
                shuffledItems[0].set('active', true);
                nextItem = shuffledItems[0];
            } else {
                var nextItemIndex;

                if (!_.isUndefined(removedActiveItemIndex)) {
                    nextItemIndex = removedActiveItemIndex;
                } else {
                    nextItemIndex = this.indexOf(this.findWhere({ active: true })) + 1;
                    if (nextItemIndex <= 0) throw "Failed to find nextItemIndex";
                }
                
                //  Activate the next item by index. Potentially go back one if deleting last item.
                if (nextItemIndex === this.length) {

                    if (repeatButtonState === RepeatButtonState.RepeatStream) {
                        this.at(0).set('active', true);

                        //  TODO: Might be sending an erroneous trigger on delete?
                        //  Only one item in the playlist and it was already active, resend activated trigger.
                        if (this.length === 1) {
                            this.at(0).trigger('change:active', this.at(0), true);
                        }

                        nextItem = this.at(0);
                    }
                    else if (radioEnabled) {

                        var randomRelatedSong = this.getRandomRelatedSong();

                        if (randomRelatedSong === null) {
                            console.error("No related song found.");
                        } else {

                            nextItem = this.add({
                                song: randomRelatedSong,
                                title: randomRelatedSong.get('title'),
                                active: true
                            });
                            
                        }

                    }
                    //  If the active item was deleted and there's nothing to advance forward to -- activate the previous item and pause.
                    //  This should go AFTER radioEnabled check because it feels good to skip to the next one when deleting last with radio turned on.
                    else if (removedActiveItemIndex !== undefined && removedActiveItemIndex !== null) {
                        this.at(this.length - 1).set('active', true);
                        Player.pause();
                    }
                    else {

                        //  Otherwise, activate the first item in the playlist and then pause the player because playlist looping shouldn't continue.
                        this.at(0).set('active', true);
                        Player.pause();
                    }

                } else {
                    this.at(nextItemIndex).set('active', true);
                    nextItem = this.at(nextItemIndex);
                }

            }

            return nextItem;
        },
        
        //  Return the previous item or null without affecting the history.
        getPrevious: function() {

            var previousStreamItem = null;

            if (this.history.length > 1) {
                previousStreamItem = this.history[1];
            }
            
            //  If nothing found by history -- rely on settings
            if (previousStreamItem == null) {

                var shuffleEnabled = ShuffleButton.get('enabled');
                var repeatButtonState = RepeatButton.get('state');

                if (repeatButtonState === RepeatButtonState.RepeatSong) {
                    previousStreamItem = this.findWhere({ active: true }) || null;
                } else if(!shuffleEnabled) {
                    //  Activate the previous item by index. Potentially loop around to the back.
                    var activeItemIndex = this.indexOf(this.findWhere({ active: true }));

                    if (activeItemIndex === 0) {
                        if (repeatButtonState === RepeatButtonState.RepeatStream) {
                            previousStreamItem = this.at(this.length - 1) || null;
                        }
                    } else {
                        previousStreamItem = this.at(activeItemIndex - 1) || null;
                    }

                }
            }

            return previousStreamItem;
        },

        //  TODO: Maybe this should just call getPrevious?
        activatePrevious: function() {

            //  Peel off currentStreamItem from the top of history.
            this.history.shift();
            var previousStreamItem = this.history.shift();

            //  If no previous item was found in the history, then just go back one item
            if (previousStreamItem == null) {

                var shuffleEnabled = ShuffleButton.get('enabled');
                var repeatButtonState = RepeatButton.get('state');

                if (repeatButtonState === RepeatButtonState.RepeatSong) {
                    var activeItem = this.findWhere({ active: true });
                    activeItem.trigger('change:active', activeItem, true);
                } else if (shuffleEnabled) {
                    var shuffledItems = _.shuffle(this.where({ playedRecently: false }));
                    shuffledItems[0].set('active', true);
                } else {
                    //  Activate the previous item by index. Potentially loop around to the back.
                    var activeItemIndex = this.indexOf(this.findWhere({ active: true }));

                    if (activeItemIndex === 0) {
                        if (repeatButtonState === RepeatButtonState.RepeatStream) {
                            this.at(this.length - 1).set('active', true);
                        }
                    } else {
                        this.at(activeItemIndex - 1).set('active', true);
                    }
                }

            } else {
                previousStreamItem.set('active', true);
            }
        },
        
        ban: function (streamItem) {
            this.bannedSongIdList.push(streamItem.get('song').get('id'));
        },
        
        clear: function () {
            this.bannedSongIdList = [];
            this.reset();
        },
        
        moveToIndex: function (streamItemId, index) {
            var currentIndex = this.indexOf(this.get(streamItemId));
            this.models.splice(index, 0, this.models.splice(currentIndex, 1)[0]);

            //  TODO: Something better than this... would be nice to actually be sorting.. again lends itself
            //  to using the sequencedCollection for client-side collections, too.
            this.trigger('sort');
        },
        
        getBySong: function (song) {
            return this.find(function (streamItem) {
                return streamItem.get('song').get('id') === song.get('id');
            });
        }

    });

    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.StreamItems = new StreamItems();
    return window.StreamItems;
});