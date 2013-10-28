define([
    'videoSearchResultView',
    'videoSearchResults',
    'text!../template/videoSearchResults.htm',
    'utility',
    'contextMenuGroups',
    'streamItems'
], function (VideoSearchResultView, VideoSearchResults, VideoSearchResultsTemplate, Utility, ContextMenuGroups, StreamItems) {
    'use strict';

    var VideoSearchResultsView = Backbone.View.extend({
        className: 'left-list',
        
        template: _.template(VideoSearchResultsTemplate),
        
        attributes: {
            id: 'searchResultsList'
        },
        
        searchingMessage: null,
        instructions: null,
        noResultsMessage: null,
        
        events: {
            'contextmenu': 'showContextMenu'
        },
        
        render: function () {

            this.$el.html(this.template({
                //  Mix in chrome to reference internationalize.
                'hasSearchResults': VideoSearchResults.length > 0,
                'hasSearchQuery': this.parent.model.get('searchQuery').length > 0,
                'isSearching': this.parent.model.get('searchJqXhr') !== null,
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
                scroll: false,
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
            this.noResultsMessage = this.$el.find('div.noResults');

            return this;
        },
        
        initialize: function (options) {

            if (!options.parent) throw "VideoSearchResultsView expects to be initialized with a parent ActivePlaylist";
            this.parent = options.parent;

            this.listenTo(VideoSearchResults, 'reset', this.render);
            this.listenTo(this.parent.model, 'change:searchJqXhr', this.toggleLoadingMessage);
            
            Utility.scrollChildElements(this.el, '.item-title');
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
            this.parent.model.get('relatedPlaylist').addByVideoInformation(videoInformation, function () {
                console.log("success");
            });

        },
        
        toggleLoadingMessage: function() {

            var isSearching = this.parent.model.get('searchJqXhr') !== null;
            this.searchingMessage.toggleClass('hidden', !isSearching);
            this.noResultsMessage.addClass('hidden');
            this.instructions.addClass('hidden');
        },

        showContextMenu: function (event) {
            //  Whenever a context menu is shown -- set preventDefault to true to let foreground know to not reset the context menu.
            event.preventDefault();

            if (event.target === event.currentTarget) {
                //  Didn't bubble up from a child -- clear groups.
                ContextMenuGroups.reset();
            }

            var isPlaySelectedDisabled = VideoSearchResults.selected().length === 0;

            ContextMenuGroups.add({
                items: [{
                    text: chrome.i18n.getMessage("playSelected") + ' (' + VideoSearchResults.selected().length + ')',
                    disabled: isPlaySelectedDisabled,
                    title: isPlaySelectedDisabled ? chrome.i18n.getMessage("playSelectedDisabled") : '',
                    onClick: function () {

                        if (!isPlaySelectedDisabled) {

                            var videoInformation = _.map(VideoSearchResults.selected(), function (videoSearchResult) {
                                return videoSearchResult.get('videoInformation');
                            });

                            StreamItems.addMultipleByVideoInformation(videoInformation, true);

                        }

                    }
                }]
            });
        }
    });

    return VideoSearchResultsView;
});