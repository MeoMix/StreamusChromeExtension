define([
    'youTubeDataAPI',
    'utility'
], function(YouTubeDataAPI, Utility) {
    'use strict';

    var VideoSearchView = Backbone.View.extend({
        
        className: 'left-pane',
        
        template: _.template($('#videoSearchTemplate').html()),
        
        attributes: {
            id: 'search'
        },
        
        events: {
            'focus .searchBar input': 'highlight',
            'blur .searchBar input': 'lowlight',
            
            'input .searchBar input': 'showVideoSuggestions'
            
            //  TODO: How to support these?
            //'drop .addInput': 'parseUrlInput',
            //'paste .addInput': 'parseUrlInput',
        },

        render: function () {
            //this.model.toJSON()
            this.$el.html(this.template());
            
            return this;
        },
        
        initialize: function () {
            

        },
        
        highlight: function() {
            this.$el.find('.searchBottomOutline').addClass('active');
        },
        
        lowlight: function() {
            this.$el.find('.searchBottomOutline').removeClass('active');
        },
        
        showAndFocus: function() {
            this.$el.fadeIn();
            this.$el.find('.searchBar input').focus();
        },
        
        hide: function() {
            this.$el.fadeOut();
        },
        
        getUserInput: function () {
            return $.trim(this.$el.find('.searchBar input').val());
        },
        
        //  Searches youtube for video results based on the given text.
        showVideoSuggestions: function () {

            var userInput = this.getUserInput();

            //  Clear results if there is no text.
            if (userInput === '') {

                $('#searchResultList').empty();

            } else {
                var self = this;

                YouTubeDataAPI.search(userInput, function (videoInformationList) {

                    //  Do not display results if searchText was modified while searching.
                    if (userInput === self.getUserInput()) {

                        var videoSourceList = _.map(videoInformationList, function (videoInformation) {

                            //  I wanted the label to be duration | title to help delinate between typing suggestions and actual videos.
                            var videoDuration = parseInt(videoInformation.media$group.yt$duration.seconds);
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
                });
            }
        },

    });


    return VideoSearchView;
});