define([
    'videoSearchResultView',
    'videoSearchResults',
    'text!../template/videoSearchResults.htm'
], function (VideoSearchResultView, VideoSearchResults, VideoSearchResultsTemplate) {
    'use strict';

    var VideoSearchResultsView = Backbone.View.extend({
        className: 'left-list',
        
        template: _.template(VideoSearchResultsTemplate),
        
        attributes: {
            id: 'searchResultsList'
        },
        
        searchingMessage: null,
        instructions: null,
        
        render: function () {

            this.$el.html(this.template({
                //  Mix in chrome to reference internationalize.
                'hasSearchResults': VideoSearchResults.length > 0,
                'chrome.i18n': chrome.i18n
            }));

            this.addAll();
            
            this.$el.find('img.lazy').lazyload({
                effect: 'fadeIn',
                container: this.$el
            });

            this.$el.find('.videoSearchResult').draggable({
                helper: function() {

                    var helper = $('<span>', {
                        'class': 'videoSearchResultsLength'
                    });

                    return helper;
                },
                appendTo: 'body',
                containment: 'DOM',
                zIndex: 1500,
                distance: 5,
                refreshPositions: true,
                cursorAt: {
                    right: 35,
                    bottom: 40
                },
                start: function (event, ui) {

                    var draggedVideoId = $(this).data('videoid');
                    var videoSearchResult = VideoSearchResults.get(draggedVideoId);
                    videoSearchResult.set('selected', true);
                    videoSearchResult.set('dragging', true);

                    //  Set it here not in helper because dragStart may select a search result.
                    $(ui.helper).text(VideoSearchResults.selected().length);
                },
                
                stop: function () {

                    var draggedVideoId = $(this).data('videoid');
                    var videoSearchResult = VideoSearchResults.get(draggedVideoId);

                    //  TODO: Is it really necessary to wrap this in a set timeout?
                    setTimeout(function() {
                        videoSearchResult.set('dragging', false);
                    });

                }
            });

            this.searchingMessage = this.$el.find('div.searching');
            this.instructions = this.$el.find('div.instructions');

            return this;
        },
        
        initialize: function (options) {

            if (!options.parent) throw "VideoSearchResultsView expects to be initialized with a parent ActivePlaylist";
            this.parent = options.parent;

            this.listenTo(VideoSearchResults, 'reset', this.render);
            this.listenTo(this.parent.model, 'change:searchJqXhr', this.toggleLoadingMessage);
        },
        
        addOne: function (videoSearchResult) {

            //  The first 11 search results should not be lazily loaded because they're immediately visible.
            //  So, keep track of the item's index on the view to be able to account for this during rendering.
            var index = VideoSearchResults.indexOf(videoSearchResult);

            var videoSearchResultView = new VideoSearchResultView({
                model: videoSearchResult,
                index: index
            });
            
            this.$el.append(videoSearchResultView.render().el);
        },
        
        addAll: function () {
            VideoSearchResults.each(this.addOne, this);
        },
        
        addItemToActivePlaylist: function (event) {

            var clickedItem = $(event.currentTarget);

            var videoSearchResult = VideoSearchResults.get(clickedItem.data('videoid'));
            var videoInformation = videoSearchResult.get('videoInformation');

            //  TODO: It feels a bit sloppy to have to reference this through the parent.model
            this.parent.model.get('relatedPlaylist').addItemByInformation(videoInformation, function () {
                console.log("success");
            });

        },
        
        toggleLoadingMessage: function() {

            var isSearching = this.parent.model.get('searchJqXhr') !== null;
            this.searchingMessage.toggleClass('hidden', !isSearching);
            this.instructions.addClass('hidden');
        }
    });

    return VideoSearchResultsView;
});