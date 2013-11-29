define([
    'videoSearchResults',
    'youTubeV2API',
    'utility',
    'dataSource',
    'dataSourceType'
], function (VideoSearchResults, YouTubeV2API, Utility, DataSource, DataSourceType) {
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
            
            this.on('change:searchQuery', _.throttle(function (model, searchQuery) {

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
                    
                    //  If the user is just typing in whatever -- search for it, otherwise handle special data sources.
                    var dataSource = new DataSource({
                        urlToParse: searchQuery
                    });
                    
                    var searchJqXhr;
                    
                    //  TODO: Support displaying playlists and channel URLs.
                    //  If the search query had a valid YouTube Video ID inside of it -- display that result, otherwise search.
                    if (dataSource.get('type') === DataSourceType.YOUTUBE_VIDEO) {
                        
                        searchJqXhr = YouTubeV2API.getVideoInformation({
                            videoId: dataSource.get('sourceId'),
                            success: function(videoInformation) {
                                self.set('searchJqXhr', null);
                                videoSearchResults.setFromVideoInformation(videoInformation);
                            },
                            error: function() {
                                self.set('searchJqXhr', null);
                                videoSearchResults.reset();
                            }
                        });
                        
                    } else {
                        
                        searchJqXhr = YouTubeV2API.search({
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
                    
                    this.set('searchJqXhr', searchJqXhr);

                    //  TODO: Handle other data sources
                    //var playlistIndicator = 'playlist,';

                    //var searchQueryPrefix = searchQuery.substring(0, playlistIndicator.length);

                    //if (searchQueryPrefix === playlistIndicator) {
                    
                    //    searchJqXhr = YouTubeV2API.searchPlaylist({
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
                }

            }, 100));

        }

    });

    return VideoSearch;
});