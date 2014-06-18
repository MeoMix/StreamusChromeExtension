define([
    'background/collection/multiSelectCollection',
    'background/mixin/sequencedCollectionMixin',
    'background/model/notificationsManager',
    'background/model/streamItem',
    'background/model/song',
    'background/model/player',
    'background/model/buttons/shuffleButton',
    'background/model/buttons/radioButton',
    'background/model/buttons/repeatButton',
    'common/enum/repeatButtonState',
    'common/enum/playerState',
    'common/model/youTubeV3API'
], function (MultiSelectCollection, SequencedCollectionMixin, NotificationsManager, StreamItem, Song, Player, ShuffleButton, RadioButton, RepeatButton, RepeatButtonState, PlayerState, YouTubeV3API) {
    'use strict';
    
    var StreamItems = MultiSelectCollection.extend(_.extend({}, SequencedCollectionMixin, {
        model: StreamItem,
        localStorage: new Backbone.LocalStorage('StreamItems'),

        initialize: function () {
            //  TODO: History is lost when Streamus is restarted. Not a HUGE deal since it just affects shuffling, but would be nice to save it.
            //  TODO: Probably make a stream model instead of extending streamItems
            //  Give StreamItems a history: https://github.com/jashkenas/backbone/issues/1442
            _.extend(this, { history: [] });

            var self = this;

            this.on('add', function (addedStreamItem) {
                //  Ensure a streamItem is always active
                if (_.isUndefined(this.getActiveItem())) {
                    addedStreamItem.save({ active: true });
                }
            });
            
            this.on('remove', function (model) {
                //  Destroy the model so that Backbone.LocalStorage keeps localStorage up-to-date.
                model.destroy();
            });

            this.on('change:active', function (changedStreamItem, active) {
                //  Ensure only one streamItem is active at a time by deactivating all other active streamItems.
                if (active) {
                    this._activateItem(changedStreamItem);
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
                        streamItem.save({ playedRecently: false });
                    });
                }
            });
            
            //  Beatport can send messages to add stream items and play directly if user has clicked on a button.
            chrome.runtime.onMessage.addListener(function (request) {
                switch (request.method) {
                    case 'searchAndStreamByQuery':
                        self.searchAndAddByTitle({
                            title: request.query,
                            playOnAdd: true,
                            error: function(error) {
                                console.error("Failed to add song by title: " + request.query, error);
                            }
                        });
                    break;
                    case 'searchAndStreamByQueries':
                        var queries = request.queries;

                        if (queries.length > 0) {
                            //  Queue up all of the queries.
                            var query = queries.shift();

                            var recursiveShiftTitleAndAdd = function () {
                                if (queries.length > 0) {
                                    query = queries.shift();
                                    self.searchAndAddByTitle({
                                        title: query,
                                        error: function(error) {
                                            console.error("Failed to add song by title: " + query, error);
                                        },
                                        complete: recursiveShiftTitleAndAdd
                                    });
                                }
                            };

                            //  Start playing the first song queued up
                            self.searchAndAddByTitle({
                                title: query,
                                playOnAdd: true,
                                error: function (error) {
                                    console.error("Failed to add song by title: " + query, error);
                                },
                                complete: recursiveShiftTitleAndAdd
                            });
                        }
                    break;
                }
            });

            //  Load any existing StreamItems from local storage
            this.fetch();

            //  If there's any stream items -- one must be active once fetched from localStorage, make sure the YouTube player loads it.
            var activeItem = this.getActiveItem();
            if (!_.isUndefined(activeItem)) {
                this._activateItem(activeItem);
            }
            
            //  Don't want to persist selections after restarts -- doesn't really make sense to.
            this.deselectAllExcept();
            
            MultiSelectCollection.prototype.initialize.apply(this, arguments);
        },
        
        _activateItem: function(streamItem) {
            this.deactivateAllExcept(streamItem);
            var songId = streamItem.get('song').get('id');
            //  Maintain the state of the player by playing or cueuing based on current player state.
            var playerState = Player.get('state');

            //  TODO: Maybe ended here isn't right if they had only 1 item in the playlist and then add another with the first ended.
            if (playerState === PlayerState.Playing || playerState === PlayerState.Ended) {
                Player.loadSongById(songId);
            } else {
                Player.cueSongById(songId);
            }

            this.history.unshift(streamItem);
        },
        
        searchAndAddByTitle: function (options) {
            YouTubeV3API.getSongInformationByTitle({
                title: options.title,
                success: function (songInformation) {
                    var song = new Song();
                    song.setYouTubeInformation(songInformation);
                    
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

            NotificationsManager.showNotification({
                iconUrl: iconUrl,
                title: title,
                message: message
            });
        },
        
        addSongs: function (songs, options) {
            //  Support not passing in options
            options = options || {};

            if (!_.isArray(songs)) {
                songs = [songs];
            }

            var playOnAdd = _.isUndefined(options.playOnAdd) ? false : options.playOnAdd;
            if (playOnAdd) {
                Player.playOnceSongChanges();
            }
            
            var index = _.isUndefined(options.index) ? this.length : options.index;

            //  TODO: I don't like the wordyness of this... maybe I should go back to setting active as a property.
            var createdStreamItems = [];
            _.each(songs, function (song) {
                //  TODO: Make each item unique / no duplicates allowed.
                var sequence = this.getSequenceFromIndex(index);
                
                var streamItem = new StreamItem({
                    song: song,
                    title: song.get('title'),
                    sequence: sequence
                });

                var createdStreamItem = this.create(streamItem);
                createdStreamItems.push(createdStreamItem);
                index++;
            }, this);

            if (playOnAdd || options.markFirstActive) {
                createdStreamItems[0].save({ active: true });
            }

            return createdStreamItems;
        },

        deactivateAllExcept: function(changedStreamItem) {
            this.each(function(streamItem) {
                if (streamItem != changedStreamItem) {
                    streamItem.save({ active: false });
                }
            });
        },

        getActiveItem: function () {
            return this.findWhere({ active: true });
        },
        
        //  Take each streamItem's array of related songs, pluck them all out into a collection of arrays
        //  then flatten the arrays into a single array of songs.
        getRelatedSongs: function() {
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

                    return sameSongId || sameCleanTitle;
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
            
            if (relatedSong === null) {
                console.error("No related song found.");
            }
            
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
                shuffledItems[0].save({ active: true });
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
                        this.at(0).save({ active: true });

                        //  TODO: Might be sending an erroneous trigger on delete?
                        //  Only one item in the playlist and it was already active, resend activated trigger.
                        if (this.length === 1) {
                            this.at(0).trigger('change:active', this.at(0), true);
                        }

                        nextItem = this.at(0);
                    }
                    else if (radioEnabled) {
                        var randomRelatedSong = this.getRandomRelatedSong();

                        var addedSongs = this.addSongs(randomRelatedSong, {
                            //  Mark as active after adding it to deselect other active items and ensure it is visible visually.
                            markFirstActive: true
                        });

                        nextItem = addedSongs[0];
                    }
                    //  If the active item was deleted and there's nothing to advance forward to -- activate the previous item and pause.
                    //  This should go AFTER radioEnabled check because it feels good to skip to the next one when deleting last with radio turned on.
                    else if (removedActiveItemIndex !== undefined && removedActiveItemIndex !== null) {
                        this.at(this.length - 1).save({ active: true });
                        Player.pause();
                    }
                    else {
                        //  Otherwise, activate the first item in the playlist and then pause the player because playlist looping shouldn't continue.
                        this.at(0).save({ active: true });
                        Player.pause();
                    }
                } else {
                    this.at(nextItemIndex).save({ active: true });
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
                    shuffledItems[0].save({ active: true });
                } else {
                    //  Activate the previous item by index. Potentially loop around to the back.
                    var activeItemIndex = this.indexOf(this.findWhere({ active: true }));

                    if (activeItemIndex === 0) {
                        if (repeatButtonState === RepeatButtonState.RepeatStream) {
                            this.at(this.length - 1).save({ active: true });
                        }
                    } else {
                        this.at(activeItemIndex - 1).save({ active: true });
                    }
                }
            } else {
                previousStreamItem.save({ active: true });
            }
        },
        
        clear: function () {
            this.history.length = 0;
            this.set();
        },
        
        getBySong: function (song) {
            return this.find(function (streamItem) {
                return streamItem.get('song').get('id') === song.get('id');
            });
        }
    }));

    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.StreamItems = new StreamItems();
    return window.StreamItems;
});