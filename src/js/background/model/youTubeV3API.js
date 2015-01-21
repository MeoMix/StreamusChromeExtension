﻿define(function (require) {
    'use strict';

    var Songs = require('background/collection/songs');
    var YouTubeAPIKey = require('background/key/youTubeAPI');
    var SongType = require('common/enum/songType');
    var YouTubeServiceType = require('common/enum/youTubeServiceType');
    var Utility = require('common/utility');

    var YouTubeV3API = Backbone.Model.extend({
        //  Performs a search and then grabs the first item and returns its title
        //  Expects options: { title: string, success: function, error: function }
        getSongByTitle: function (options) {
            return this.search({
                text: options.title,
                //  Expect to find a playable song within the first 10 -- don't need the default 50 items
                maxResults: 10,
                success: function (searchResponse) {
                    if (searchResponse.songs.length === 0) {
                        if (options.error) options.error(chrome.i18n.getMessage('failedToFindSong'));
                    } else {
                        options.success(searchResponse.songs.first());
                    }
                },
                error: options.error,
                complete: options.complete
            });
        },
        
        //  Performs a search of YouTube with the provided text and returns a list of playable songs (<= max-results)
        //  Expects options: { maxResults: integer, text: string, fields: string, success: function, error: function }
        search: function (options) {
            return this._doRequest(YouTubeServiceType.Search, {
                success: function (response) {
                    var songIds = _.map(response.items, function (item) {
                        return item.id.videoId;
                    });
                    
                    this.getSongs({
                        songIds: songIds,
                        success: function (songs) {
                            options.success({
                                songs: songs, 
                                nextPageToken: response.nextPageToken,
                            });
                        },
                        error: options.error,
                        complete: options.complete
                    });
                }.bind(this),
                error: function(error) {
                    if (options.error) options.error(error);
                    if (options.complete) options.complete();
                }
            }, {
                part: 'id',
                //  Probably set this to its default of video/playlist/channel at some point.
                type: 'video',
                maxResults: options.maxResults || 50,
                pageToken: options.pageToken || '',
                q: options.text.trim(),
                fields: 'nextPageToken, items/id/videoId',
                //  I don't think it's a good idea to filter out results based on safeSearch for music.
                safeSearch: 'none'
            });
        },
        
        getChannelUploadsPlaylistId: function (options) {
            var listOptions = _.extend({
                part: 'contentDetails',
                fields: 'items/contentDetails/relatedPlaylists/uploads'
            }, _.pick(options, ['id', 'forUsername']));
            
            return this._doRequest('channels', {
                success: function (response) {
                    if (_.isUndefined(response.items[0])) {
                        options.error();
                        throw new Error("No response.items found for options:" + JSON.stringify(options));
                    }

                    options.success({
                        uploadsPlaylistId: response.items[0].contentDetails.relatedPlaylists.uploads
                    });
                },
                error: options.error,
                complete: options.complete
            }, listOptions);
        },
        
        getSong: function (options) {
            return this.getSongs({
                songIds: [options.songId],
                success: function (songs) {
                    if (songs.length === 0) {
                        options.error(chrome.i18n.getMessage('failedToFindSong') + ' ' + options.songId);
                    } else {
                        options.success(songs.first());
                    }
                },
                error: options.error,
                complete: options.complete
            });
        },

        //  Returns the results of a request for a segment of a channel, playlist, or other dataSource.
        getPlaylistSongs: function (options) {
            return this._doRequest(YouTubeServiceType.PlaylistItems, {
                success: function (response) {
                    var songIds = _.map(response.items, function (item) {
                        return item.contentDetails.videoId;
                    });

                    this.getSongs({
                        songIds: songIds,
                        success: function (songs) {
                            options.success({
                                songs: songs,
                                nextPageToken: response.nextPageToken,
                            });
                        },
                        error: options.error,
                        complete: options.complete
                    });
                }.bind(this),
                error: function(error) {
                    if (options.error) options.error(error);
                    if (options.complete) options.complete();
                }
            }, {
                part: 'contentDetails',
                maxResults: 50,
                playlistId: options.playlistId,
                pageToken: options.pageToken || '',
                fields: 'nextPageToken, items/contentDetails/videoId'
            });
        },

        getRelatedSongs: function (options) {
            return this._doRequest(YouTubeServiceType.Search, {
                success: function (response) {
                    //  It is possible to receive no response if a song was removed from YouTube but is still known to Streamus.
                    if (!response) {
                        throw new Error("No response for: " + JSON.stringify(options));
                    }

                    var songIds = _.map(response.items, function (item) {
                        return item.id.videoId;
                    });

                    this.getSongs({
                        songIds: songIds,
                        success: options.success,
                        error: options.error,
                        complete: options.complete
                    });
                }.bind(this),
                error: function(error) {
                    if (options.error) options.error(error);
                    if (options.complete) options.complete();
                }
            }, {
                part: 'id',
                relatedToVideoId: options.songId,
                maxResults: options.maxResults || 5,
                //  If the relatedToVideoId parameter has been supplied, type must be video.
                type: 'video',
                fields: 'items/id/videoId'
            });
        },
        
        //  Converts a list of YouTube song ids into actual video information by querying YouTube with the list of ids.
        getSongs: function (options) {
            return this._doRequest(YouTubeServiceType.Videos, {
                success: function (response) {
                    if (_.isUndefined(response)) {
                        if (options.error) options.error();
                        throw new Error("No response found for options:" + JSON.stringify(options));
                    }

                    if (_.isUndefined(response.items)) {
                        if (options.error) {
                            var errorMessage = options.songIds.length > 1 ? chrome.i18n.getMessage('failedToFindSongs') : chrome.i18n.getMessage('failedToFindSong');
                            options.error(errorMessage);
                        }
                    } else {
                        var songs = this._itemListToSongs(response.items);
                        options.success(songs);
                    }
                }.bind(this),
                error: options.error,
                complete: options.complete
            }, {
                part: 'contentDetails, snippet',
                maxResults: 50,
                id: options.songIds.join(','),
                fields: 'items/id, items/contentDetails/duration, items/snippet/title, items/snippet/channelTitle'
            });
        },
        
        //  Expects options: { channelId: string, success: function, error: function };
        getTitle: function (options) {
            var ajaxDataOptions = _.extend({
                part: 'snippet',
                fields: 'items/snippet/title'
            }, _.pick(options, ['id', 'forUsername']));

            return this._doRequest(options.serviceType, {
                success: function (response) {
                    if (response.items.length === 0) {
                        options.error(chrome.i18n.getMessage('errorRetrievingTitle'));
                    } else {
                        options.success(response.items[0].snippet.title);
                    }
                },
                error: options.error,
                complete: options.complete
            }, ajaxDataOptions);
        },

        _doRequest: function (serviceType, ajaxOptions, ajaxDataOptions) {
            return $.ajax(_.extend(ajaxOptions, {
                url: 'https://www.googleapis.com/youtube/v3/' + serviceType,
                data: _.extend({
                    key: YouTubeAPIKey
                }, ajaxDataOptions)
            }));
        },
        
        _itemListToSongs: function(itemList) {
            return new Songs(_.map(itemList, function (item) {
                return {
                    id: item.id,
                    duration: Utility.iso8061DurationToSeconds(item.contentDetails.duration),
                    title: item.snippet.title,
                    author: item.snippet.channelTitle,
                    type: SongType.YouTube
                };
            }));
        }
    });

    //  TODO: Don't return new instance even if its not stateful.
    return new YouTubeV3API();
});