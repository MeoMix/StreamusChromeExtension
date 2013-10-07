define([
    'videoSearchResultsView',
    'text!../template/videoSearch.htm'
], function (VideoSearchResultsView, VideoSearchTemplate) {
    'use strict';

    var VideoSearchView = Backbone.View.extend({
        
        className: 'left-pane',
        
        template: _.template(VideoSearchTemplate),
        
        videoSearchResultsView: null,
        
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
            this.$el.html(this.template(
                _.extend(this.model.toJSON(), {
                    //  Mix in chrome to reference internationalize.
                    'chrome.i18n': chrome.i18n
                })
            ));

            console.log("RENDERING VIDEO SEARCH RESULTS VIEW");
            this.$el.find('.left-top-divider').after(this.videoSearchResultsView.render().el);

            return this;
        },
        
        initialize: function () {

            this.videoSearchResultsView = new VideoSearchResultsView({
                parent: this
            });

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
        
        hide: function(callback) {
            var self = this;
            
            this.$el.fadeOut(function() {
                self.remove();
                callback();
            });
            
        },
        
        getUserInput: function () {
            return $.trim(this.$el.find('.searchBar input').val());
        },
        
        //  Searches youtube for video results based on the given text.
        showVideoSuggestions: function () {
            var userInput = this.getUserInput();
            this.model.set('userInput', userInput);
        }

    });

    return VideoSearchView;
});