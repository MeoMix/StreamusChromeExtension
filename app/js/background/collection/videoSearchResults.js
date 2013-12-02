var VideoSearchResults;

define([
    'videoSearchResult',
    'video'
], function (VideoSearchResult, Video) {
    'use strict';

    var videoSearchResultsCollection = Backbone.Collection.extend({
        model: VideoSearchResult,
        
        initialize: function () {

            this.on('change:selected', function (changedItem, selected) {

                var selectedResults = this.selected();

                if (selectedResults.length === 1) {
                    selectedResults[0].set('firstSelected', true);
                }
                else if (!selected) {
                    //  An item which is no longer selected definitely can't be the first selected item.
                    changedItem.set('firstSelected', false);
                }

            });

            this.on('change:firstSelected', function(changedItem, firstSelected) {

                if (firstSelected) {
                    
                    this.each(function (item) {
                        
                        if (item != changedItem) {
                            item.set('firstSelected', false);
                        }
                        
                    });
                }
                
            });

        },
        
        deselectAllExcept: function (selectedItemCid) {

            this.each(function(item) {

                if (item.cid != selectedItemCid) {
                    item.set('selected', false);
                }

            });
        },

        selected: function () {
            return this.where({ selected: true });
        },
        
        setFromVideoInformation: function(videoInformation) {
            //  Convert video information into search results which contain a reference to the full data incase needed later.
            var videoSearchResult = new VideoSearchResult({
                video: new Video({
                    videoInformation: videoInformation
                })
            });

            this.setResults(videoSearchResult);
        },
        
        //  Call setResults with nothing to clear it, more clear public method.
        clear: function() {
            this.setResults();
        },
        
        //  Ensure resetting always calls destroy.
        setResults: function(results) {
            //  Destroy all existing models before resetting in order to cause the views to clean-up and prevent memory leaks.
            _.invoke(this.toArray(), 'destroy');
            this.reset(results);
        },
        
        setFromVideoInformationList: function (videoInformationList) {
            //  Convert video information into search results which contain a reference to the full data incase needed later.
            var videoSearchResults = _.map(videoInformationList, function (videoInformation) {

                var videoSearchResult = new VideoSearchResult({
                    video: new Video({
                        videoInformation: videoInformation
                    })
                });

                return videoSearchResult;
            });

            this.setResults(videoSearchResults);
        },
        
        //setFromPlaylistInformationList: function(playlistInformationList) {
        //    //  Convert video information into search results which contain a reference to the full data incase needed later.
        //    var videoSearchResults = _.map(playlistInformationList, function (playlistInformation) {

        //        var playlistSearchResult = new VideoSearchResult({
        //            video: new Video({
        //                videoInformation: videoInformation
        //            })
        //        });

        //        return videoSearchResult;
        //    });

        //    this.reset(videoSearchResults);
        //},
        
        getByVideoId: function (videoId) {

            var foundVideoSearchResult = this.find(function(videoSearchResult) {
                return videoSearchResult.get('video').get('id') === videoId;
            });

            return foundVideoSearchResult;

        }
        
    });

    VideoSearchResults = new videoSearchResultsCollection;

    return VideoSearchResults;
});