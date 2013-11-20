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
            'contextmenu': 'showContextMenu',
            'click .videoSearchResult': 'setSelectedOnClick'
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
                threshold: 500,
                container: this.$el
            });

            var self = this;
            this.$el.find('.listItem').draggable({
                helper: function() {

                    var helper = $('<span>', {
                        'class': 'videoSearchResultsLength'
                    });

                    return helper;
                },
                appendTo: 'body',
                containment: 'DOM',
                zIndex: 1500,
                delay: 100,
                refreshPositions: true,
                scroll: false,
                cursorAt: {
                    right: 35,
                    bottom: 40
                },               
                start: function (event, ui) {
                    $('body').addClass('dragging');

                    var draggedVideoId = $(this).data('videoid');

                    var videoSearchResult = VideoSearchResults.getByVideoId(draggedVideoId);
                    //videoSearchResult.set('dragging', true);

                    self.doSetSelected({
                        searchResult: videoSearchResult,
                        //  Simulate ctrlKey click when dragging an already selected item to not deselect other results
                        ctrlKey: videoSearchResult.get('selected'),
                        drag: true
                    });

                    //  Set it here not in helper because dragStart may select a search result.
                    $(ui.helper).text(VideoSearchResults.selected().length);
                },
                
                stop: function () {
                    $('body').removeClass('dragging');
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
            
            var videoSearchResultElements = VideoSearchResults.map(function (videoSearchResult, index) {
                
                var videoSearchResultView = new VideoSearchResultView({
                    model: videoSearchResult,
                    index: index
                });

                return videoSearchResultView.render().el;

            });
            
            this.$el.append(videoSearchResultElements);
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

            if (event.target === event.currentTarget || $(event.target).hasClass('big-text') || $(event.target).hasClass('i-4x')) {
                //  Didn't bubble up from a child -- clear groups.
                ContextMenuGroups.reset();
            }

            var selectedSearchResults = VideoSearchResults.selected();

            var isPlaySelectedDisabled = selectedSearchResults.length === 0;
            var isAddSelectedDisabled = selectedSearchResults.length === 0;

            ContextMenuGroups.add({
                items: [{
                    text: chrome.i18n.getMessage("playSelected") + ' (' + selectedSearchResults.length + ')',
                    disabled: isPlaySelectedDisabled,
                    title: isPlaySelectedDisabled ? chrome.i18n.getMessage("playSelectedDisabled") : '',
                    onClick: function () {

                        if (!isPlaySelectedDisabled) {

                            var videos = _.map(selectedSearchResults, function (videoSearchResult) {
                                return videoSearchResult.get('video');
                            });

                            StreamItems.addByVideos(videos, true);

                        }

                    }
                }, {
                    text: chrome.i18n.getMessage("addSelected") + ' (' + selectedSearchResults.length + ')',
                    disabled: isAddSelectedDisabled,
                    title: isAddSelectedDisabled ? chrome.i18n.getMessage("addSelectedDisabled") : '',
                    onClick: function () {

                        if (!isAddSelectedDisabled) {

                            var videos = _.map(selectedSearchResults, function (videoSearchResult) {
                                return videoSearchResult.get('video');
                            });

                            StreamItems.addByVideos(videos, false);

                        }

                    }
                }]
            });
        },
        
        doSetSelected: function(options) {
            var searchResult = options.searchResult;
            
            var shiftKeyPressed = options.shiftKey || false;
            var ctrlKeyPressed = options.ctrlKey || false;
            var isDrag = options.drag || false;
            
            //  A dragged item is always selected.
            searchResult.set('selected', !searchResult.get('selected') || isDrag);
            
            //  When the shift key is pressed - select a block of search result items
            if (shiftKeyPressed) {

                var firstSelectedIndex = 0;
                var searchResultIndex = VideoSearchResults.indexOf(searchResult);

                //  If the first item is being selected with shift held -- firstSelectedIndex isn't used and selection goes from the top.
                if (VideoSearchResults.selected().length > 1) {
                    //  Get the search result which was selected first and go from its index.
                    var firstSelectedSearchResult = VideoSearchResults.findWhere({ firstSelected: true });
                    firstSelectedIndex = VideoSearchResults.indexOf(firstSelectedSearchResult);
                }

                VideoSearchResults.each(function (videoSearchResult, index) {

                    //  If searchResultIndex is 10, firstSelectedIndex is 5, select 5 through 10
                    var isBetweenAbove = index <= searchResultIndex && index >= firstSelectedIndex;
                    //  If searchResultIndex is 5, firstSelectedIndex is 10, select 5 through 10
                    var isBetweenBelow = index >= searchResultIndex && index <= firstSelectedIndex;

                    videoSearchResult.set('selected', isBetweenBelow || isBetweenAbove);

                });

            }
            else if (ctrlKeyPressed) {
                //  Using the ctrl key to select an item resets firstSelect (which is a special scenario)
                //  but doesn't lose the other selected items.
                //  TODO: Is it OK to set firstSelect to true here even if the item was set to unselected? That seems like a bug, double check!
                searchResult.set('firstSelected', true);
            }
            else {
                //  If the user isn't holding the control key when they click -- all other selections are lost.
                VideoSearchResults.deselectAllExcept(searchResult.cid);
            }

        },
        
        setSelectedOnClick: function (event) {
  
            var videoId = $(event.currentTarget).data('videoid');
            var clickedVideoSearchResult = VideoSearchResults.getByVideoId(videoId);

            this.doSetSelected({
                shiftKey: event.shiftKey,
                ctrlKey: event.ctrlKey,
                searchResult: clickedVideoSearchResult
            });

        }
    });

    return VideoSearchResultsView;
});