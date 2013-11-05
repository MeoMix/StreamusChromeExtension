var VideoSearchResults;

define([
    'videoSearchResult'
], function (VideoSearchResult) {
    'use strict';

    var videoSearchResultsCollection = Backbone.Collection.extend({
        model: VideoSearchResult,
        
        initialize: function() {
            
            this.on('change:selected', function (changedItem, selected) {
                
                //  TODO: Support keyboard shortcuts allowing multiple selections
                //  Ensure only one item is selected at a time by de-selecting all other selected item.
                if (selected) {
                    this.deselectAllExcept(changedItem.cid);
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
                videoInformation: videoInformation
            });

            this.reset(videoSearchResult);
        },
        
        setFromVideoInformationList: function (videoInformationList) {
            //  Convert video information into search results which contain a reference to the full data incase needed later.
            var videoSearchResults = _.map(videoInformationList, function (videoInformation) {

                var videoSearchResult = new VideoSearchResult({
                    videoInformation: videoInformation
                });

                return videoSearchResult;
            });

            this.reset(videoSearchResults);
        }
        
    });

    VideoSearchResults = new videoSearchResultsCollection;

    return VideoSearchResults;
});