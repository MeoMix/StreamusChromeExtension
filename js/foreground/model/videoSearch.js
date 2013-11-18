define([
    'videoSearchResults',
    'youTubeDataAPI',
    'utility'
], function (VideoSearchResults, YouTubeDataAPI, Utility) {
    'use strict';

    var VideoSearch = Backbone.Model.extend({
        
        defaults: function () {
            return {
                searchQuery: '',
                searchJqXhr: null,
                videoSearchResults: VideoSearchResults,
                playlist: null
            };
        },
        
        initialize: function() {
            var self = this;
            
            //  TODO: Probably want to rate-limit this slightly.
            this.on('change:searchQuery', function (model, searchQuery) {

                //  Do not display results if searchText was modified while searching, abort old request.
                var previousSearchJqXhr = this.get('searchJqXhr');
                
                if (previousSearchJqXhr) {
                    previousSearchJqXhr.abort();
                    //  I don't want the view's loading icon to stutter on cancelling.
                    this.set('searchJqXhr', null, { silent: true });
                }

                var videoSearchResults = this.get('videoSearchResults');
                
                //  Trigger a reset when clearing the search query to get the view to redraw from 'no results' to 'type something'
                if (videoSearchResults.length > 0 || searchQuery === '') {
                    videoSearchResults.reset();
                }

                if (searchQuery !== '') {

                    //var playlistIndicator = 'playlist,';

                    //var searchQueryPrefix = searchQuery.substring(0, playlistIndicator.length);

                    //if (searchQueryPrefix === playlistIndicator) {

                    //    searchJqXhr = YouTubeDataAPI.searchPlaylist({
                    //        text: searchQuery.substring(playlistIndicator.length + 1),
                    //        success: function (playlistInformationList) {

                    //            self.set('searchJqXhr', null);
                    //            videoSearchResults.setFromPlaylistInformationList(playlistInformationList);
                    //        },
                    //        error: function () {
                    //            self.set('searchJqXhr', null);
                    //        }
                    //    });

                    //} else {

                        //  If the search query had a valid ID inside of it -- display that result, otherwise search.
                        var videoId = Utility.parseVideoIdFromUrl(searchQuery);

                        var searchJqXhr;

                        if (videoId) {
                            searchJqXhr = YouTubeDataAPI.getVideoInformation({
                                videoId: videoId,
                                success: function (videoInformation) {

                                    self.set('searchJqXhr', null);
                                    videoSearchResults.setFromVideoInformation(videoInformation);
                                },
                                error: function () {
                                    self.set('searchJqXhr', null);
                                    videoSearchResults.reset();
                                }
                            });
                        } else {
                            //  TODO: Support displaying playlists and channel URLs here.

                            searchJqXhr = YouTubeDataAPI.search({
                                text: searchQuery,
                                success: function (videoInformationList) {

                                    self.set('searchJqXhr', null);
                                    videoSearchResults.setFromVideoInformationList(videoInformationList);

                                },
                                error: function () {
                                    self.set('searchJqXhr', null);
                                }
                            });

                        }

                    //}

                    this.set('searchJqXhr', searchJqXhr);
                    
                }

            });

        }

    });

    return VideoSearch;
});