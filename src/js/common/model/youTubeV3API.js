define([
    'common/enum/songType',
    'common/enum/youTubeServiceType',
    'common/model/utility'
], function (SongType, YouTubeServiceType, Utility) {
    'use strict';

    var YouTubeV3API = Backbone.Model.extend({
        //  Performs a search and then grabs the first item most related to the search title by calculating
        //  the levenshtein distance between all the possibilities and returning the result with the lowest distance.
        //  Expects options: { title: string, success: function, error: function }
        getSongInformationByTitle: function (options) {
            return this.search({
                text: options.title,
                //  Expect to find a playable song within the first 10 -- don't need the default 50 items
                maxResults: 10,
                success: function (response) {
                    if (response.songInformationList.length === 0) {
                        if (options.error) options.error('No playable song found after searching with title ' + options.title);
                    } else {
                        options.success(response.songInformationList[0]);
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
                    
                    this.getSongInformationList({
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
                //  Probably set this to its default of video/playlist/channel at some point.
                type: 'video',
                maxResults: options.maxResults || 50,
                q: $.trim(options.text),
                fields: 'items/id/videoId',
                //  I don't think it's a good idea to filter out results based on safeSearch for music.
                safeSearch: 'none'
            });
        },
        
        getChannelUploadsPlaylistId: function (options) {
            var listOptions = {
                part: 'contentDetails',
                fields: 'items/contentDetails/relatedPlaylists/uploads'
            };
            
            if (!_.isUndefined(options.username)) {
                _.extend(listOptions, {
                    forUsername: options.username
                });
            }
            else if (!_.isUndefined(options.channelId)) {
                _.extend(listOptions, {
                    id: options.channelId
                });
            }
            
            return this._doRequest('channels', {
                success: function (response) {
                    options.success({
                        uploadsPlaylistId: response.items[0].contentDetails.relatedPlaylists.uploads
                    });
                },
                error: options.error,
                complete: options.complete
            }, listOptions);
        },
        
        getSongInformation: function (options) {
            return this.getSongInformationList({
                songIds: [options.songId],
                success: function (response) {
                    if (response.missingSongIds.length === 1) {
                        options.error('Failed to find song ' + options.songId);
                    } else {
                        options.success(response.songInformationList[0]);
                    }
                },
                error: options.error,
                complete: options.complete
            });
        },

        //  Returns the results of a request for a segment of a channel, playlist, or other dataSource.
        getPlaylistSongInformationList: function (options) {
            return this._doRequest(YouTubeServiceType.PlaylistItems, {
                success: function (response) {
                    var songIds = _.map(response.items, function (item) {
                        return item.contentDetails.videoId;
                    });

                    this.getSongInformationList({
                        songIds: songIds,
                        success: function (songInformationListResponse) {
                            options.success(_.extend({
                                nextPageToken: response.nextPageToken,
                            }, songInformationListResponse));
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

        getRelatedSongInformationList: function (options) {
            return this._doRequest(YouTubeServiceType.Search, {
                success: function (response) {
                    var songIds = _.map(response.items, function (item) {
                        return item.id.videoId;
                    });

                    this.getSongInformationList({
                        songIds: songIds,
                        success: function (songInformationListResponse) {
                            //  OK to drop missingSongIds; not expecting any because YouTube determines related song ids.
                            options.success(songInformationListResponse.songInformationList);
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
                relatedToVideoId: options.songId,
                maxResults: options.maxResults || 5,
                //  If the relatedToVideoId parameter has been supplied, type must be video.
                type: 'video',
                fields: 'items/id/videoId'
            });
        },
        
        //  Converts a list of YouTube song ids into actual video information by querying YouTube with the list of ids.
        getSongInformationList: function (options) {
            return this._doRequest(YouTubeServiceType.Videos, {
                success: function (response) {
                    if (_.isUndefined(response.items)) {
                        if (options.error) options.error('The response\'s item list was undefined. Song(s) may have been banned.');
                    } else {
                        var songInformationList = _.map(response.items, function (item) {
                            return {
                                id: item.id,
                                duration: Utility.iso8061DurationToSeconds(item.contentDetails.duration),
                                title: item.snippet.title,
                                author: item.snippet.channelTitle,
                                type: SongType.YouTube
                            };
                        });

                        var missingSongIds = _.difference(options.songIds, _.pluck(songInformationList, 'id'));

                        options.success({
                            songInformationList: songInformationList,
                            missingSongIds: missingSongIds
                        });
                    }
                },
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
            var ajaxDataOptions = {
                part: 'snippet',
                fields: 'items/snippet/title'
            };
            
            if (!_.isUndefined(options.id)) {
                ajaxDataOptions.id = options.id;
            }
            else if (!_.isUndefined(options.forUsername)) {
                ajaxDataOptions.forUsername = options.forUsername;
            } else {
                throw new Error('Expected id or forUsername');
            }

            return this._doRequest(options.serviceType, {
                success: function (response) {
                    if (response.items.length === 0) {
                        options.error('No title found');
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
                    //  The Simple API Access API key is used here. Please note that it is set to allow "Referers: Any referer allowed" because
                    //  a Google Chrome extension does not send a referer by design. As such, it seems easiest to allow any referer rather than try to 
                    //  fix the extension for slightly improved security.
                    //  https://code.google.com/apis/console/b/0/?noredirect&pli=1#project:346456917689:access
                    key: 'AIzaSyBWegNdKdnwKGr2bCKRzqXnWw00kA7T2lk'
                }, ajaxDataOptions)
            }));
        }
    });

    return new YouTubeV3API();
});