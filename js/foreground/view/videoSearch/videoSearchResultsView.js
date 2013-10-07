define([
    'videoSearchResultItemView',
    'videoSearchResultItems'
], function (VideoSearchResultItemView, VideoSearchResultItems) {
    'use strict';

    var VideoSearchResultsView = Backbone.View.extend({
        className: 'left-list',
        
        template: _.template($('#videoSearchResultsTemplate').html()),
        
        attributes: {
            id: 'searchResultsList'
        },
        
        render: function () {

            this.$el.html(this.template({
                    //  Mix in chrome to reference internationalize.
                    'hasSearchResults': VideoSearchResultItems.length > 0,
                    'chrome.i18n': chrome.i18n
                })
            );

            this.addAll();
            
            this.$el.find('img.lazy').lazyload({
                effect: 'fadeIn',
                container: this.$el
            });

            this.$el.find('.videoSearchResultItem ').draggable({
                helper: function() {

                    console.log("Setting helper");

                    var helper = $('<span>', {
                        'class': 'videoSearchResultsLength'
                    });

                    return helper;
                },
                appendTo: 'body',
                containment: 'DOM',
                zIndex: 1500,
                distance: 5,
                cursorAt: {
                    right: 35,
                    bottom: 40
                },
                start: function (event, ui) {

                    var draggedVideoId = $(this).data('videoid');
                    var draggedVideo = VideoSearchResultItems.get(draggedVideoId);
                    draggedVideo.set('selected', true);
                    draggedVideo.set('dragging', true);

                    //  Set it here not in helper because dragStart may select a search result.
                    $(ui.helper).text(VideoSearchResultItems.selected().length);
                },
                
                stop: function () {

                    var draggedVideoId = $(this).data('videoid');
                    var draggedVideo = VideoSearchResultItems.get(draggedVideoId);
                    console.log("I am setting dragging to false");
  
                    setTimeout(function() {
                        draggedVideo.set('dragging', false);
                    });

                }
            });

            return this;
        },
        
        initialize: function (options) {

            if (!options.parent) throw "VideoSearchResultsView expects to be initialized with a parent ActivePlaylist";
            this.parent = options.parent;

            this.listenTo(VideoSearchResultItems, 'reset', this.render);
        },
        
        addOne: function (videoSearchResultItem) {

            //  The first 11 search results should not be lazily loaded because they're immediately visible.
            //  So, keep track of the item's index on the view to be able to account for this during rendering.
            var index = VideoSearchResultItems.indexOf(videoSearchResultItem);

            var videoSearchResultItemView = new VideoSearchResultItemView({
                model: videoSearchResultItem,
                index: index
            });
            
            this.$el.append(videoSearchResultItemView.render().el);
        },
        
        addAll: function () {
            VideoSearchResultItems.each(this.addOne, this);
        },
        
        addItemToActivePlaylist: function (event) {

            var clickedItem = $(event.currentTarget);

            var videoSearchResultItem = VideoSearchResultItems.get(clickedItem.data('videoid'));
            var videoInformation = videoSearchResultItem.get('videoInformation');

            //  TODO: It feels a bit sloppy to have to reference this through the parent.model
            this.parent.model.get('relatedPlaylist').addItemByInformation(videoInformation, function () {
                console.log("success");
            });

        }
    });

    return VideoSearchResultsView;
});