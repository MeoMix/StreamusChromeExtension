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
        
        searchUnderline: null,
        
        events: {
            'focus .searchBar input': 'highlight',
            'blur .searchBar input': 'lowlight',
            'input .searchBar input': 'showVideoSuggestions',
            'click #button-back': 'destroyModel'
            
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

            this.searchUnderline = $('.searchBar .underline');

            return this;
        },
        
        initialize: function () {

            this.videoSearchResultsView = new VideoSearchResultsView({
                parent: this
            });
            
            this.listenTo(this.model, 'change:searchJqXhr', this.toggleSearching);
            this.listenTo(this.model, 'destroy', this.hide);
        },
        
        highlight: function() {
            this.searchUnderline.addClass('active');
        },
        
        lowlight: function() {
            this.searchUnderline.removeClass('active');
        },
        
        showAndFocus: function() {
            this.$el.fadeIn();
            
            var searchInput = $('.searchBar input');
            searchInput.focus();
        },
        
        destroyModel: function () {
            this.model.destroy();
        },
        
        hide: function() {
            var self = this;
            
            this.$el.fadeOut(function() {
                self.remove();
            });
        },
        
        getSearchQuery: function () {
            var searchInput = $('.searchBar input');
            var searchQuery = $.trim(searchInput.val());

            return searchQuery;
        },
        
        //  Searches youtube for video results based on the given text.
        showVideoSuggestions: function () {
            var searchQuery = this.getSearchQuery();

            this.model.set('searchQuery', searchQuery);
        }

    });

    return VideoSearchView;
});