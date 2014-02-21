define([
    'background/collection/multiSelectCollection',
    'background/model/videoSearchResult',
    'background/model/video'
], function (MultiSelectCollection, VideoSearchResult, Video) {
    'use strict';
    
    //  If the foreground requests, don't instantiate -- return existing from the background.
    if (!_.isUndefined(chrome.extension.getBackgroundPage().window.VideoSearchResults)) {
        return chrome.extension.getBackgroundPage().window.VideoSearchResults;
    }

    var VideoSearchResults = MultiSelectCollection.extend({
        model: VideoSearchResult,
        
        //  Call setResults with nothing to clear it, more clear public method.
        clear: function () {
            this.setResults();
        },
        
        //  Ensure resetting always calls destroy.
        setResults: function(results) {
            //  Destroy all existing models before resetting in order to cause the views to clean-up and prevent memory leaks.
            _.invoke(this.toArray(), 'destroy');
            this.reset(results);
        },
        
        setFromVideoInformation: function (videoInformation) {
            //  Convert video information into search results which contain a reference to the full data incase needed later.
            var videoSearchResult = new VideoSearchResult({
                video: new Video({
                    videoInformation: videoInformation
                })
            });

            this.setResults(videoSearchResult);
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
        
        getByVideoId: function (videoId) {
            var foundVideoSearchResult = this.find(function(videoSearchResult) {
                return videoSearchResult.get('video').get('id') === videoId;
            });

            return foundVideoSearchResult;
        },
        
        //  Returns the underlying Videos of the selected VideoSearchResults.
        getSelectedVideos: function() {
            return _.map(this.selected(), function (searchResult) {
                return searchResult.get('video');
            });
        }
        
    });

    //  Exposed globally so that the foreground can access the same instance through chrome.extension.getBackgroundPage()
    window.VideoSearchResults = new VideoSearchResults();
    return window.VideoSearchResults;
});