//  The videos tab header. Users may add videos by clicking on Add Videos.
//  Clicking Add Videos will allow the user to either search w/ auto-complete suggestions, or to paste youtube URLs into the input.
define([
    'contentHeaderView',
    'youTubeDataAPI',
    'utility',
    'dialog',
    'dialogView'
], function (ContentHeaderView, YouTubeDataAPI, Utility, Dialog, DialogView) {
    'use strict';
    
    var PlaylistItemInputView = Backbone.View.extend({
        
        contentHeaderView: null,
        
        className: 'header',
        
        events: {
          
            'input .addInput': 'showVideoSuggestions',
            'drop .addInput': 'parseUrlInput',
            'paste .addInput': 'parseUrlInput',
            'focus .addInput': 'searchIfNotEmpty'

        },
        
        render: function () {
            var self = this;

            this.$el.html();
            this.$el.append(this.contentHeaderView.render().el);
            
            //  Provides the drop-down suggestions and video suggestions.
            this.contentHeaderView.enableAutocompleteOnUserInput({
                autoFocus: false,
                source: [],
                position: {
                    my: "left top",
                    at: "left bottom"
                },
                //  minLength: 0 allows empty search triggers for updating source display.
                minLength: 0,
                focus: function () {
                    //  Don't change the input as the user changes selections.
                    return false;
                },
                select: function (event, ui) {
                    //  Don't change the text when user clicks their video selection.
                    event.preventDefault();
                    self.contentHeaderView.clearUserInput();
                    self.model.addByVideoInformation(ui.item.value);
                }
            });

            return this;
        },
        
        initialize: function () {

            this.contentHeaderView = new ContentHeaderView({
                model: this.model,
                buttonText: 'Add Video',
                inputPlaceholderText: 'Search or Enter YouTube video URL',
                expanded: true
            });
            
        },
        
        changeModel: function(newModel) {
            this.model = newModel;
            this.contentHeaderView.changeModel(newModel);
            this.render();

        },
        
        //  Searches youtube for video results based on the given text.
        showVideoSuggestions: function () {
            var self = this;
            
            var userInput = this.contentHeaderView.getUserInput();

            //  Clear results if there is no text.
            if (userInput === '') {

                this.contentHeaderView.setAutocompleteSource([]);

            } else {
                
                YouTubeDataAPI.search({
                    text: userInput,
                    success: function(videoInformationList) {

                        //  Do not display results if searchText was modified while searching.
                        if (userInput === self.contentHeaderView.getUserInput()) {

                            var videoSourceList = _.map(videoInformationList, function(videoInformation) {

                                //  I wanted the label to be duration | title to help delinate between typing suggestions and actual videos.
                                var videoDuration = parseInt(videoInformation.media$group.yt$duration.seconds, 10);
                                var videoTitle = videoInformation.title.$t;
                                var label = '<b>' + Utility.prettyPrintTime(videoDuration) + "</b>  " + videoTitle;

                                return {
                                    label: label,
                                    value: videoInformation
                                };
                            });

                            //  Show videos found instead of suggestions.
                            self.contentHeaderView.setAutocompleteSource(videoSourceList);
                            self.contentHeaderView.triggerAutocompleteSearch();

                        }
                    }
                });
                
            }
        },
        
        parseUrlInput: function () {
            var self = this;
            
            //  Wrapped in a timeout to support 'rightclick->paste' 
            setTimeout(function () {
                var userInput = self.contentHeaderView.getUserInput();
                var parsedVideoId = Utility.parseVideoIdFromUrl(userInput);

                //  If found a valid YouTube link then just add the video.
                if (parsedVideoId) {
                    self.handleValidInput(parsedVideoId);
                }
            });
            
        },
        
        searchIfNotEmpty: function () {
            
            var userInput = this.contentHeaderView.getUserInput();

            if (userInput !== '') {
                this.contentHeaderView.triggerAutocompleteSearch();
            }
            
        },
        
        handleValidInput: function (videoId) {
            var self = this;
            this.contentHeaderView.clearUserInput();


        }
        
    });

    return PlaylistItemInputView;
});