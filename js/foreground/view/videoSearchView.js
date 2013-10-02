define([
    'videoSearch',
    'videoSearchResultsView'
], function (VideoSearch, VideoSearchResultsView) {
    'use strict';

    var VideoSearchView = Backbone.View.extend({
        
        className: 'left-pane',
        
        model: new VideoSearch,
        
        template: _.template($('#videoSearchTemplate').html()),
        
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

            this.$el.find('.left-top-divider').after(this.videoSearchResultsView.render().el);

            return this;
        },
        
        initialize: function () {

            this.videoSearchResultsView = new VideoSearchResultsView({
                model: this.model.get('videoSearchResultItems')
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
        
        hide: function() {
            this.$el.fadeOut();
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