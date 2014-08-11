define([
    'background/collection/multiSelectCollection',
    'background/mixin/sequencedCollectionMixin',
    'background/model/chromeNotifications',
    'background/model/streamItem',
    'background/model/song',
    'background/model/player',
    'background/model/buttons/shuffleButton',
    'background/model/buttons/radioButton',
    'background/model/buttons/repeatButton',
    'common/enum/repeatButtonState',
    'common/enum/playerState',
    'common/model/youTubeV3API'
], function (MultiSelectCollection, SequencedCollectionMixin, ChromeNotifications, StreamItem, Song, Player, ShuffleButton, RadioButton, RepeatButton, RepeatButtonState, PlayerState, YouTubeV3API) {
    'use strict';
    
    var StreamItems = MultiSelectCollection.extend(_.extend({}, SequencedCollectionMixin, {
        model: StreamItem,
        localStorage: new Backbone.LocalStorage('StreamItems'),

        initialize: function () {
            //  TODO: History is lost when Streamus is restarted. Not a HUGE deal since it just affects shuffling, but would be nice to save it.
            //  TODO: Probably make a stream model instead of extending streamItems
            //  Give StreamItems a history: https://github.com/jashkenas/backbone/issues/1442
            _.extend(this, { history: [] });

            this.on('add', this._onAdd);
            this.on('remove', this._onRemove);
            this.on('reset', this._onReset);
            this.on('change:active', this._onChangeActive);
            this.listenTo(Player, 'change:state', this._onChangePlayerState);
            this.on('change:playedRecently', this._onChangePlayedRecently);
            chrome.runtime.onMessage.addListener(this._onRuntimeMessage.bind(this));

            //  Load any existing StreamItems from local storage
            this.fetch();

            //  TODO: Don't persist selectedness to localStorage.
            this.deselectAll();

            var activeItem = this.getActiveItem();
            if (!_.isUndefined(activeItem)) {
                this._loadActiveItem(activeItem);
            }

            MultiSelectCollection.prototype.initialize.apply(this, arguments);
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

            console.time('hi');
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

                var createdStreamItem = this.create(streamItem, { sort: false });
                createdStreamItems.push(createdStreamItem);
                index++;
            }, this);

            console.time('yep');
            
            //  If an index was provided then the collection's order might not be correct - trigger a sort. Otherwise, since just pushing onto end, it's OK not to sort.
            if (!_.isUndefined(options.index)) {
                this.sort();
            }

            if (playOnAdd || options.markFirstActive) {
                createdStreamItems[0].save({ active: true });
            }
            console.timeEnd('yep');
            console.timeEnd('hi');

            return createdStreamItems;
        },
        
        //  TODO: Function is way too big.
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
                    if (nextItemIndex <= 0) throw new Error('Failed to find nextItemIndex');
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
                        var randomRelatedSong = this._getRandomRelatedSong();

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

            //  Top item of history is active item, second item in history is the last played.
            if (this.history.length > 1) {
                previousStreamItem = this.history[1];
            }
            
            //  If nothing found by history -- rely on settings
            if (previousStreamItem == null) {
                var shuffleEnabled = ShuffleButton.get('enabled');
                var repeatButtonState = RepeatButton.get('state');

                if (repeatButtonState === RepeatButtonState.RepeatSong) {
                    //  If repeating a single song just return whichever song is already currently active.
                    previousStreamItem = this.findWhere({ active: true }) || null;
                } else if (shuffleEnabled) {
                    //  If shuffle is enabled and there's nothing in history -- grab a random song which hasn't been played recently.
                    previousStreamItem = _.shuffle(this.where({ playedRecently: false }))[0] || null;
                } else {
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

        activatePrevious: function () {
            var previousStreamItem = this.getPrevious();
            
            //  TODO: It doesn't make a ton of sense that the current item is in history (I mean, it sort of does logically... but not when reading this code.)
            //  Peel the currentStreamItem from the top of history.
            this.history.shift();
            //  Peel the previous streamItem from the top of history, as well.
            this.history.shift();
            
            //  When repeating a song -- it'll already be active, but still need to trigger a change:active event so program will respond.
            if (previousStreamItem.get('active')) {
                previousStreamItem.trigger('change:active', previousStreamItem, true);
            } else {
                previousStreamItem.save({ active: true });
            }
        },
        
        getActiveItem: function () {
            return this.findWhere({ active: true });
        },
              
        clear: function () {
            this.history.length = 0;
            //  Reset and clear instead of going through this.set() as a performance optimization
            this.reset();
            this.localStorage._clear();
        },
              
        getBySong: function (song) {
            return this.find(function (streamItem) {
                return streamItem.get('song').get('id') === song.get('id');
            });
        },
        
        showActiveNotification: function () {
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

            ChromeNotifications.create({
                iconUrl: iconUrl,
                title: title,
                message: message
            });
        },
        
        _onAdd: function (model) {
            //  Ensure a streamItem is always active
            if (_.isUndefined(this.getActiveItem())) {
                model.save({ active: true });
            }
        },
        
        _onRemove: function (model, collection, options) {
            //  Destroy the model so that Backbone.LocalStorage keeps localStorage up-to-date.
            model.destroy();
            
            //  If an item is deleted from the stream -- remove it from history, too, because you can't skip back to it.
            var historyIndex = this.history.indexOf(model);
            if (historyIndex > -1) {
                this.history.splice(historyIndex, 1);
            }

            if (model.get('active') && this.length > 0) {
                this.activateNext(options.index);
            }

            this._stopPlayerIfEmpty();
        },
        
        _onReset: function() {
            this._stopPlayerIfEmpty();
        },
        
        _onChangePlayerState: function(model, state) {
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
        },
        
        _onChangeActive: function (model, active) {
            //  Ensure only one streamItem is active at a time by deactivating all other active streamItems.
            if (active) {
                this._activateItem(model);
            }
        },
        
        _onChangePlayedRecently: function() {
            //  When all streamItems have been played recently, reset to not having been played recently.
            //  Allows for de-prioritization of played streamItems during shuffling.
            if (this.where({ playedRecently: true }).length === this.length) {
                this.each(function (streamItem) {
                    streamItem.save({ playedRecently: false });
                });
            }
        },
        
        //  Beatport can send messages to add stream items and play directly if user has clicked on a button.
        _onRuntimeMessage: function(request) {
            switch (request.method) {
                case 'searchAndStreamByQuery':
                    this._searchAndAddByTitle({
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

                        //  TODO: Too nested
                        var recursiveShiftTitleAndAdd = function () {
                            if (queries.length > 0) {
                                query = queries.shift();
                                this._searchAndAddByTitle({
                                    title: query,
                                    error: function(error) {
                                        console.error("Failed to add song by title: " + query, error);
                                    },
                                    complete: recursiveShiftTitleAndAdd.bind(this)
                                });
                            }
                        };

                        //  Start playing the first song queued up
                        this._searchAndAddByTitle({
                            title: query,
                            playOnAdd: true,
                            error: function (error) {
                                console.error("Failed to add song by title: " + query, error);
                            },
                            complete: recursiveShiftTitleAndAdd.bind(this)
                        });
                    }
                    break;
            }
        },
        
        _activateItem: function (streamItem) {
            this._deactivateAllExcept(streamItem);
            this._loadActiveItem(streamItem);
        },
        
        _loadActiveItem: function (activeItem) {
            var songId = activeItem.get('song').get('id');

            //  Maintain the state of the player by playing or cueuing based on current player state.
            var playerState = Player.get('state');

            //  TODO: Maybe ended here isn't right if they had only 1 item in the playlist and then add another with the first ended.
            if (playerState === PlayerState.Playing || playerState === PlayerState.Ended) {
                Player.loadSongById(songId);
            } else {
                Player.cueSongById(songId);
            }

            this.history.unshift(activeItem);
        },
        
        _stopPlayerIfEmpty: function () {
            if (this.length === 0) {
                Player.stop();
            }
        },
        
        _searchAndAddByTitle: function (options) {
            YouTubeV3API.getSongInformationByTitle({
                title: options.title,
                success: function (songInformation) {
                    this.addSongs(new Song(songInformation), {
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

        _deactivateAllExcept: function (changedStreamItem) {
            this.each(function(streamItem) {
                if (streamItem != changedStreamItem) {
                    streamItem.save({ active: false });
                }
            });
        },

        _getRandomRelatedSong: function() {
            var relatedSongs = this._getRelatedSongs();
            var relatedSong = relatedSongs[_.random(relatedSongs.length - 1)] || null;
            
            if (relatedSong === null) {
                console.error("No related song found.");
            }
            
            return relatedSong;
        },
        
        //  Take each streamItem's array of related songs, pluck them all out into a collection of arrays
        //  then flatten the arrays into a single array of songs.
        _getRelatedSongs: function () {
            //  Find all streamItem entities which have related song information.
            //  Some might not have information. This is OK. Either YouTube hasn't responded yet or responded with no information. Skip these.
            var streamItemsWithInfo = this.filter(function (streamItem) {
                return streamItem.get('relatedSongInformation') != null;
            });

            //  Create a list of all the related songs from all of the information of stream items.
            var relatedSongs = _.flatten(_.map(streamItemsWithInfo, function (streamItem) {
                return _.map(streamItem.get('relatedSongInformation'), function (songInformation) {
                    return new Song(songInformation);
                });
            }));

            //  Don't add any songs that are already in the stream.
            relatedSongs = _.filter(relatedSongs, function (relatedSong) {
                var alreadyExistingItem = this.find(function (streamItem) {
                    var sameSongId = streamItem.get('song').get('id') === relatedSong.get('id');
                    var sameCleanTitle = streamItem.get('song').get('cleanTitle') === relatedSong.get('cleanTitle');

                    return sameSongId || sameCleanTitle;
                });

                return alreadyExistingItem == null;
            }, this);

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
        }
    }));

    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.StreamItems = new StreamItems();
    return window.StreamItems;
});