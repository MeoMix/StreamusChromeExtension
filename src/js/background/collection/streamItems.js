define([
    'background/mixin/collectionMultiSelect',
    'background/mixin/collectionSequence',
    'background/mixin/collectionUniqueSong',
    'background/model/streamItem',
    'background/model/song',
    'background/model/youTubeV3API',
    'common/enum/repeatButtonState',
    'common/enum/playerState'
], function (CollectionMultiSelect, CollectionSequence, CollectionUniqueSong, StreamItem, Song, YouTubeV3API, RepeatButtonState, PlayerState) {
    'use strict';
    
    var StreamItems = Backbone.Collection.extend({
        model: StreamItem,
        localStorage: new Backbone.LocalStorage('StreamItems'),
        userFriendlyName: chrome.i18n.getMessage('stream'),
        mixins: [CollectionMultiSelect, CollectionSequence, CollectionUniqueSong],
        player: null,
        shuffleButton: null,
        radioButton: null,
        repeatButton: null,

        initialize: function (models, options) {
            this.player = options.player;
            this.shuffleButton = options.shuffleButton;
            this.radioButton = options.radioButton;
            this.repeatButton = options.repeatButton;

            //  TODO: History is lost when Streamus is restarted. Not a HUGE deal since it just affects shuffling, but would be nice to save it.
            //  TODO: Probably make a stream model instead of extending streamItems
            //  Give StreamItems a history: https://github.com/jashkenas/backbone/issues/1442
            _.extend(this, { history: [] });

            this.on('add', this._onAdd);
            this.on('remove', this._onRemove);
            this.on('reset', this._onReset);
            this.on('change:active', this._onChangeActive);
            this.listenTo(this.player, 'change:state', this._onChangePlayerState);
            this.listenTo(this.player, 'youTubeError', this._onPlayerError);
            this.on('change:playedRecently', this._onChangePlayedRecently);
            chrome.runtime.onMessage.addListener(this._onRuntimeMessage.bind(this));
            chrome.commands.onCommand.addListener(this._onChromeCommand.bind(this));

            //  Load any existing StreamItems from local storage
            this.fetch();

            var activeItem = this.getActiveItem();
            if (!_.isUndefined(activeItem)) {
                this.player.activateSong(activeItem.get('song'));
                
                //  TODO: This won't be necessary once I fix history persistence because activeItem should already be in history after a restart.
                this.history.unshift(activeItem);
            }
        },
        
        addSongs: function (songs, options) {
            options = _.isUndefined(options) ? {} : options;
            songs = _.isArray(songs) ? songs : [songs];

            if (options.playOnAdd) {
                this.player.set('playOnActivate', true);
            }

            var index = _.isUndefined(options.index) ? this.length : options.index;

            var createdStreamItems = [];
            _.each(songs, function (song) {
                var streamItem = new StreamItem({
                    song: song,
                    title: song.get('title'),
                    sequence: this.getSequenceFromIndex(index)
                });

                //  Provide the index that the item will be placed at because allowing re-sorting the collection is expensive.
                this.add(streamItem, {
                    at: index
                });

                //  If the item was added successfully to the collection (not duplicate) then allow for it to be created.
                if (!_.isUndefined(streamItem.collection)) {
                    streamItem.save();
                    createdStreamItems.push(streamItem);
                    index++;
                }
            }, this);
            
            if (options.playOnAdd || options.markFirstActive) {
                if (createdStreamItems.length > 0) {
                    createdStreamItems[0].save({ active: true });
                } else {
                    //  TODO: I need to notify the user that this fallback happened.
                    var song = this.getBySong(songs[0]);
                    
                    if (song.get('active')) {
                        song.trigger('change:active', song, true);
                    } else {
                        song.save({ active: true });
                    }
                }
            }

            return createdStreamItems;
        },
        
        //  TODO: Function is way too big.
        //  If a streamItem which was active is removed, activateNext will have a removedActiveItemIndex provided
        activateNext: function (removedActiveItemIndex) {
            var nextItem = null;

            var shuffleEnabled = this.shuffleButton.get('enabled');
            var radioEnabled = this.radioButton.get('enabled');
            var repeatButtonState = this.repeatButton.get('state');

            //  If removedActiveItemIndex is provided, RepeatButtonState.RepeatSong doesn't matter because the StreamItem was just deleted.
            if (_.isUndefined(removedActiveItemIndex) && repeatButtonState === RepeatButtonState.RepeatSong) {
                var activeItem = this.findWhere({ active: true });
                activeItem.trigger('change:active', activeItem, true);
                nextItem = activeItem;
            } else if (shuffleEnabled) {
                var eligibleItems = this.where({ playedRecently: false });
                
                //  TODO: It doesn't make sense that the Stream cycles indefinitely through shuffled songs without RepeatStream enabled.
                //  All songs will be played recently if there's only one item because it just finished playing.
                if (eligibleItems.length > 0) {
                    var shuffledItems = _.shuffle(eligibleItems);
                    shuffledItems[0].save({ active: true });
                    nextItem = shuffledItems[0];
                }
            } else {
                var nextItemIndex;

                if (!_.isUndefined(removedActiveItemIndex)) {
                    nextItemIndex = removedActiveItemIndex;
                } else {
                    nextItemIndex = this.indexOf(this.findWhere({ active: true })) + 1;
                    
                    if (nextItemIndex <= 0) {
                        throw new Error('Failed to find nextItemIndex. More info: ' + JSON.stringify(this));
                    }
                }
                
                //  Activate the next item by index. Potentially go back one if deleting last item.
                if (nextItemIndex === this.length) {
                    if (repeatButtonState === RepeatButtonState.RepeatStream) {
                        var firstItem = this.at(0);
                        
                        //  Looped back to the front but that item was already active (only 1 in playlist during a skip), resend activated trigger.
                        if (firstItem.get('active')) {
                            firstItem.trigger('change:active', firstItem, true);
                        } else {
                            firstItem.save({ active: true });
                        }

                        nextItem = firstItem;
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
                    else if (!_.isUndefined(removedActiveItemIndex)) {
                        this.at(this.length - 1).save({ active: true });
                        this.player.pause();
                    }
                    else {
                        //  Otherwise, activate the first item in the playlist and then pause the player because playlist looping shouldn't continue.
                        this.at(0).save({ active: true });
                        this.player.pause();
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
                var shuffleEnabled = this.shuffleButton.get('enabled');
                var repeatButtonState = this.repeatButton.get('state');

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
            
            //  Peel the current item from the top of history.
            this.history.shift();
            //  Peel the previous item from the top of history, as well.
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
        
        _showActiveNotification: function () {
            var activeItem = this.getActiveItem();
            var activeSongId = activeItem.get('song').get('id');

            Streamus.channels.backgroundNotification.commands.trigger('show:notification', {
                iconUrl: 'https://img.youtube.com/vi/' + activeSongId + '/default.jpg',
                //  TODO: i18n
                title: 'Now Playing',
                message: activeItem.get('title')
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
            this.history = _.without(this.history, model);

            if (model.get('active') && this.length > 0) {
                this.activateNext(options.index);
            }

            this._stopPlayerIfEmpty();
            
            //  The item removed could've been the last one not played recently. Need to ensure that this isn't the case so there are always valid shuffle targets.
            this._ensureAllNotPlayedRecentlyExcept();
        },
        
        _onReset: function() {
            this._stopPlayerIfEmpty();
        },
        
        _onChangePlayerState: function (model, state) {
            if (state === PlayerState.Ended) {
                //  TODO: I need to be able to check whether there's an active item or not before calling activateNext.
                this.player.set('playOnActivate', true);
                var nextItem = this.activateNext();
                
                if (nextItem === null) {
                    this.player.set('playOnActivate', false);
                }
            }
            else if (state === PlayerState.Playing) {
                //  Only display notifications if the foreground isn't active -- either through the extension popup or as a URL tab
                this._showActiveNotification();
            }
        },
        
        _onPlayerError: function (playerError) {
            if (this.length > 0) {
                this.player.set('playOnActivate', true);
                //  TODO: It would be better if I could get the next item instead of having to activate it automatically.
                var nextItem = this.activateNext();

                if (nextItem === null) {
                    this.player.set('playOnActivate', false);

                    //  TODO: Once I refactoring activateNext and have better ways of handling errors then I can re-enable this, but infinite looping for now sucks.
                    //  YouTube's API does not emit an error if the cue'd video has already emitted an error.
                    //  So, when put into an error state, re-cue the video so that subsequent user interactions will continue to show the error.
                    //this.player.activateSong(this.getActiveItem().get('song'));
                }
            } else {
                //  TODO: I don't understand how _onPlayerError could ever fire when length is 0, but it happens in production.
                var error = new Error('Error ' + playerError + ' happened while StreamItems was empty.');
                Streamus.channels.error.commands.trigger('log:error', error);
            }
        },
        
        _onChangeActive: function (model, active) {
            //  Ensure only one streamItem is active at a time by deactivating all other active streamItems.
            if (active) {
                this._activateItem(model);
            }
        },
        
        _onChangePlayedRecently: function (model, playedRecently) {
            if (playedRecently) {
                this._ensureAllNotPlayedRecentlyExcept(model);
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
                    this._addByTitleList(true, request.queries);
                    break;
            }
        },
        
        _addByTitleList: function (playOnAdd, titleList) {
            if (titleList.length > 0) {
                var title = titleList.shift();

                this._searchAndAddByTitle({
                    title: title,
                    playOnAdd: playOnAdd,
                    error: function (error) {
                        console.error("Failed to add song by title: " + title, error);
                    },
                    complete: this._addByTitleList.bind(this, false, titleList)
                });
            }
        },
        
        _activateItem: function (streamItem) {
            this._deactivateAllExcept(streamItem);
            this._loadActiveItem(streamItem);
        },
        
        _loadActiveItem: function (activeItem) {
            this.player.activateSong(activeItem.get('song'));
            
            //  When deleting the last item in the stream AND it is active then you go back 1 sequentially.
            //  This can cause a duplicate to be added to history if you just came from it.
            if (this.history[0] !== activeItem) {
                this.history.unshift(activeItem);
            }
        },
        
        _stopPlayerIfEmpty: function () {
            if (this.length === 0) {
                this.player.stop();
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
                //  TODO: Uncaught Error: No related song found:[{"song":{"id":"wGegubqsWiQ","duration":254,"title":"Caravan Palace - Dragons","author":"loova31","type":1,"prettyDuration":"04:14","url":"https://youtu.be/wGegubqsWiQ","cleanTitle":"Caravan Palace - Dragons"},"tit...
                throw new Error("No related song found:" + JSON.stringify(this));
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
        },
        
        //  When all streamItems have been played recently, reset to not having been played recently.
        //  Allows for de-prioritization of played streamItems during shuffling.
        _ensureAllNotPlayedRecentlyExcept: function(model) {
            if (this.where({ playedRecently: true }).length === this.length) {
                this.each(function (streamItem) {
                    if (streamItem !== model) {
                        //  No need to notify that playedRecently is changing when resetting all.
                        streamItem.save({ playedRecently: false }, { silent: true });
                    }
                });
            }
        },
        
        _onChromeCommand: function (command) {
            //  TODO: How can I write this logic more DRYly?
            if (command === 'showActiveSong' || command === 'deleteSongFromStream' || command === 'copySongUrl' || command === 'copySongTitleAndUrl') {
                if (this.length === 0) {
                    Streamus.channels.backgroundNotification.commands.trigger('show:notification', {
                        //  TODO: i18n
                        title: chrome.i18n.getMessage('keyboardCommandFailure'),
                        message: 'Stream empty'
                    });
                } else {
                    if (command === 'showActiveSong') {
                        this._showActiveNotification();
                    }
                    else if (command === 'deleteSongFromStream') {
                        this.getActiveItem().destroy();
                    }
                    else if (command === 'copySongUrl') {
                        this.getActiveItem().get('song').copyUrl();
                    }
                    else if (command === 'copySongTitleAndUrl') {
                        this.getActiveItem().get('song').copyTitleAndUrl();
                    }
                }
            }
        }
    });

    return StreamItems;
});