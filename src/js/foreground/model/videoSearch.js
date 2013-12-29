define([
    'foreground/collection/videoSearchResults',
    'enum/dataSourceType',
    'common/model/youTubeV2API',
    'common/model/utility',
    'common/model/dataSource'
], function (VideoSearchResults, DataSourceType, YouTubeV2API, Utility, DataSource) {
    'use strict';

    var VideoSearch = Backbone.Model.extend({
        
        defaults: function () {
            return {
                searchQuery: '',
                searchJqXhr: null,
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
                }
                
                VideoSearchResults.clear();

                //  If the user is just typing in whatever -- search for it, otherwise handle special data sources.
                var dataSource = new DataSource({
                    urlToParse: searchQuery
                });
                    
                var searchJqXhr;
                    
                //  TODO: Support displaying playlists and channel URLs.
                //  If the search query had a valid YouTube Video ID inside of it -- display that result, otherwise search.
                if (dataSource.get('type') === DataSourceType.YouTubeVideo) {
                        
                    searchJqXhr = YouTubeV2API.getVideoInformation({
                        videoId: dataSource.get('sourceId'),
                        success: function(videoInformation) {
                            VideoSearchResults.setFromVideoInformation(videoInformation);
                        },
                        complete: function() {
                            self.set('searchJqXhr', null);
                        }
                    });
                        
                } else {
                        
                    searchJqXhr = YouTubeV2API.search({
                        text: searchQuery,
                        success: function (videoInformationList) {
                            //  Don't show old responses. Even with the xhr abort there's a point in time where the data could get through to the callback.
                            if (searchQuery === self.get('searchQuery')) {
                                VideoSearchResults.setFromVideoInformationList(videoInformationList);
                            }
                        },
                        complete: function() {
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

            }, 200));

        }

    });

    return VideoSearch;
});