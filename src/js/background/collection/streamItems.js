define([
    'background/collection/multiSelectCollection',
    'background/notifications',
    'background/model/streamItem',
    'background/model/video',
    'background/model/player',
    'background/model/buttons/shuffleButton',
    'background/model/buttons/radioButton',
    'background/model/buttons/repeatButton',
    'common/enum/repeatButtonState',
    'common/enum/playerState',
    'common/model/utility',
    'common/model/youTubeV2API'
], function (MultiSelectCollection, Notifications, StreamItem, Video, Player, ShuffleButton, RadioButton, RepeatButton, RepeatButtonState, PlayerState, Utility, YouTubeV2API) {
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
            _.extend(this, { bannedVideoIdList: [] });

            var self = this;

            this.on('add', function (addedStreamItem) {
                console.log("streamItems onAdd is firing", addedStreamItem);

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

                    var videoId = changedStreamItem.get('video').get('id');

                    //  Maintain the state of the player by playing or cueuing based on current player state.
                    var playerState = Player.get('state');

                    //  TODO: Maybe ended here isn't right if they had only 1 item in the playlist and then add another with the first ended.
                    if (playerState === PlayerState.Playing || playerState === PlayerState.Ended) {
                        Player.loadVideoById(videoId);
                    } else {
                        Player.cueVideoById(videoId);
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

                        //  If the foreground UI is not open, show a notification to indicate active video.
                        var activeItem = this.getActiveItem();
                        var activeVideoId = activeItem.get('video').get('id');

                        Notifications.showNotification({
                            iconUrl: 'http://img.youtube.com/vi/' + activeVideoId + '/default.jpg',
                            title: 'Now Playing',
                            message: activeItem.get('title')
                        });

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
                        self.searchAndAddByName(request.query, true);
                    break;

                    case 'searchAndStreamByQueries':
                        var queries = request.queries;

                        if (queries.length > 0) {
                            
                            var query = queries.shift();

                            var recursiveShiftVideoTitleAndAdd = function () {
                                
                                if (queries.length > 0) {
                                    query = queries.shift();
                                    self.searchAndAddByName(query, false, recursiveShiftVideoTitleAndAdd);
                                }
                                
                            };

                            self.searchAndAddByName(query, true, function () {
                                recursiveShiftVideoTitleAndAdd();
                            });
                            
                        }
                    break;
                }

            });

        },
        
        searchAndAddByName: function(videoTitle, playOnAdd, callback) {
            var self = this;
            
            YouTubeV2API.search({
                text: videoTitle,
                maxResults: 10,
                success: function (videoInformationList) {

                    if (videoInformationList.length === 0) {
                        console.error("Failed to find any videos for:", videoTitle);
                    } else {

                        var video = new Video({
                            videoInformation: videoInformationList[0]
                        });
                        
                        self.addByVideo(video, !!playOnAdd);

                    }

                    if (callback) {
                        callback();
                    }
                }
            });
        },
        
        addByPlaylistItems: function (playlistItems, playOnAdd) {

            var videos = playlistItems.pluck('video');
            
            if (videos.length === 1) {
                this.addByVideo(videos[0], playOnAdd);
            } else {
                this.addByVideos(videos, playOnAdd);
            }
            
        },
        
        //  TODO: DRY!
        addByDraggedVideoSearchResults: function(videoSearchResults, index) {

            if (!_.isArray(videoSearchResults)) throw "Error";

            //  TODO: It would be nice if this was a bulk-insert, but I don't expect people to drag too many.
            var streamItems = _.map(videoSearchResults, function (videoSearchResult) {
                return {
                    video: videoSearchResult.get('video'),
                    title: videoSearchResult.get('video').get('title')
                };
            });

            this.add(streamItems, {
                at: index
            });
        },
        
        addByDraggedPlaylistItems: function(playlistItems, index) {
            //  TODO: It would be nice if this was a bulk-insert, but I don't expect people to drag too many.
            if (!_.isArray(playlistItems)) throw "Error";

            var streamItems = _.map(playlistItems, function (playlistItem) {
                return {
                    video: playlistItem.get('video'),
                    title: playlistItem.get('title')
                };
            });

            this.add(streamItems, {
                at: index
            });
        },
        
        addByPlaylistItem: function(playlistItem, playOnAdd) {
            if (playOnAdd) {
                Player.playOnceVideoChanges();
            }
            
            this.add({
                video: playlistItem.get('video'),
                title: playlistItem.get('title'),
                //  Activate and play the first added item if playOnAdd is set to true
                active: playOnAdd
            });
        },
        
        addByVideo: function (video, playOnAdd) {
            
            if (playOnAdd) {
                Player.playOnceVideoChanges();
            }
            
            this.add({
                video: video,
                title: video.get('title'),
                //  Activate and play the first added item if playOnAdd is set to true
                active: playOnAdd
            });

        },
        
        addByVideos: function (videos, playOnAdd) {
            
            if (!_.isArray(videos)) {
                return this.addByVideo(videos, playOnAdd);
            }

            if (playOnAdd) {
                Player.playOnceVideoChanges();
            }
            
            var streamItems = _.map(videos, function (video, iterator) {

                return new StreamItem({
                    video: video,
                    title: video.get('title'),
                    //  Activate and play the first added item if playOnAdd is set to true
                    active: playOnAdd && iterator === 0
                });
                
            });

            this.add(streamItems);
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
        
        //  TODO: Change getRelatedVideos into a property so I can watch for relatedVideos existing.
        //  Take each streamItem's array of related videos, pluck them all out into a collection of arrays
        //  then flatten the arrays into a collection of videos.
        getRelatedVideos: function() {

            //  Find all streamItem entities which have related video information.
            //  Some might not have information. This is OK. Either YouTube hasn't responded yet or responded with no information. Skip these.
            var streamItemsWithInfo = this.filter(function (streamItem) {
                return streamItem.get('relatedVideoInformation') != null;
            });

            //  Create a list of all the related videos from all of the information of stream items.
            var relatedVideos = _.flatten(_.map(streamItemsWithInfo, function (streamItem) {

                return _.map(streamItem.get('relatedVideoInformation'), function (relatedVideoInformation) {

                    return new Video({
                        videoInformation: relatedVideoInformation
                    });

                });

            }));

            //  Don't add any videos that are already in the stream.
            var self = this;

            relatedVideos = _.filter(relatedVideos, function (relatedVideo) {
                var alreadyExistingItem = self.find(function (streamItem) {

                    var sameVideoId = streamItem.get('video').get('id') === relatedVideo.get('id');
                    var sameCleanTitle = streamItem.get('video').get('cleanTitle') === relatedVideo.get('cleanTitle');

                    var inBanList = _.contains(self.bannedVideoIdList, relatedVideo.get('id'));

                    return sameVideoId || sameCleanTitle || inBanList;
                });

                return alreadyExistingItem == null;
            });

            // Try to filter out 'playlist' songs, but if they all get filtered out then back out of this assumption.
            var tempFilteredRelatedVideos = _.filter(relatedVideos, function (relatedVideo) {
                //  assuming things >8m are playlists.
                var isJustOneSong = relatedVideo.get('duration') < 480;
                var isNotLive = relatedVideo.get('title').toLowerCase().indexOf('live') === -1;

                return isJustOneSong && isNotLive;
            });

            if (tempFilteredRelatedVideos.length !== 0) {
                relatedVideos = tempFilteredRelatedVideos;
            }

            return relatedVideos;
        },

        getRandomRelatedVideo: function() {

            var relatedVideos = this.getRelatedVideos();
            var relatedVideo = relatedVideos[_.random(relatedVideos.length - 1)] || null;
            
            return relatedVideo;
        },
        
        //  If a streamItem which was active is removed, activateNext will have a removedActiveItemIndex provided
        activateNext: function (removedActiveItemIndex) {

            var nextItem = null;

            var shuffleEnabled = ShuffleButton.get('enabled');
            var radioEnabled = RadioButton.get('enabled');
            var repeatButtonState = RepeatButton.get('state');

            //  If removedActiveItemIndex is provided, RepeatButtonState -> Video doesn't matter because the video was just deleted.
            if (removedActiveItemIndex === undefined && repeatButtonState === RepeatButtonState.RepeatVideo) {
                var activeItem = this.findWhere({ active: true });
                activeItem.trigger('change:active', activeItem, true);
                nextItem = activeItem;
            } else if (shuffleEnabled) {
                var shuffledItems = _.shuffle(this.where({ playedRecently: false }));
                shuffledItems[0].set('active', true);
                nextItem = shuffledItems[0];
            } else {
                var nextItemIndex;

                //  TODO: I shouldn't have to check both undefined and null here.
                if (removedActiveItemIndex !== undefined && removedActiveItemIndex !== null) {
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
                        //  If the active item was deleted and there's nothing to advance forward to -- activate the previous item and pause.
                    else if (removedActiveItemIndex !== undefined && removedActiveItemIndex !== null) {
                        this.at(this.length - 1).set('active', true);
                        Player.pause();
                    }
                    else if (radioEnabled) {

                        var randomRelatedVideo = this.getRandomRelatedVideo();

                        if (randomRelatedVideo === null) {
                            console.error("No related video found.");
                        } else {

                            nextItem = this.add({
                                video: randomRelatedVideo,
                                title: randomRelatedVideo.get('title'),
                                active: true
                            });
                            
                        }

                    } else {

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

                if (repeatButtonState === RepeatButtonState.RepeatVideo) {
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

                if (repeatButtonState === RepeatButtonState.RepeatVideo) {
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
            this.bannedVideoIdList.push(streamItem.get('video').get('id'));
        },
        
        clear: function () {
            this.bannedVideoIdList = [];
            this.reset();
        },
        
        moveToIndex: function (streamItemId, index) {
            var currentIndex = this.indexOf(this.get(streamItemId));
            this.models.splice(index, 0, this.models.splice(currentIndex, 1)[0]);

            //  TODO: Something better than this... would be nice to actually be sorting.. again lends itself
            //  to using the sequencedCollection for client-side collections, too.
            this.trigger('sort');
        }

    });

    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.StreamItems = new StreamItems();
    return window.StreamItems;
});