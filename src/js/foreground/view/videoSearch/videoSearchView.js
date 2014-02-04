define([
    'foreground/view/genericForegroundView',
    'foreground/view/multiSelectCompositeView',
    'foreground/model/foregroundViewManager',
    'text!template/videoSearch.html',
    'foreground/view/videoSearch/videoSearchResultView',
    'foreground/collection/contextMenuGroups',
    'foreground/model/lazyLoader',
    'foreground/view/prompt/saveVideosPromptView',
], function (GenericForegroundView, MultiSelectCompositeView, ForegroundViewManager, VideoSearchTemplate, VideoSearchResultView, ContextMenuGroups, LazyLoader, SaveVideosPromptView) {
    'use strict';
    
    var VideoSearchView = MultiSelectCompositeView.extend({

        id: 'videoSearch',
        className: 'left-pane',
        
        template: _.template(VideoSearchTemplate),
        itemViewContainer: '#videoSearchResults',
        
        itemView: VideoSearchResultView,
        //searchResultsBeingRemoved: [],
        
        ui: {
            bottomMenubar: '.left-bottom-menubar',
            searchInput: '.searchBar input',
            searchingMessage: 'div.searching',
            instructions: 'div.instructions',
            //  TODO: This could be handled by a Marionette.CollectionView's empty html.
            noResultsMessage: 'div.noResults',
            bigTextWrapper: 'div.big-text-wrapper',
            videoSearchResults: '#videoSearchResults'
        },
        
        events: _.extend({}, MultiSelectCompositeView.prototype.events, {
            'input @ui.searchInput': 'search',
            'click button#hideVideoSearch': 'hide',
            'click button#playSelected': 'playSelected',
            'click button#saveSelected': 'showSaveSelectedPrompt'
        }),
        
        triggers: {
            //  TODO: contextmenu vs contextMenu 
            'contextmenu @ui.videoSearchResults': {
                event: 'showContextMenu',
                //  Set preventDefault to true to let foreground know to not reset the context menu.
                preventDefault: true
            }
        },
        
        templateHelpers: {
            //  Mix in chrome to reference internationalize.
            'chrome.i18n': chrome.i18n
        },
        
        modelEvents: {
            'change:searchJqXhr change:searchQuery change:typing': 'toggleBigText'
        },

        collectionEvents: {
            'reset': 'toggleBigText',
            'change:selected': 'toggleBottomMenubar'
        },
        
        onAfterItemAdded: function (itemView) {
            //  TODO: onAfterItemAdded will fire as the UI is sliding open, which causes lag. It would be better to defer this until after the animation has completed.
            //if (this.model.get('isFullyVisible')) {
            //    LazyLoader.showOrSubscribe(this.ui.videoSearchResults, itemView.ui.imageThumbnail);
            //}
        },
        
        //  This gets called a lot. Queue up items being removed until defer actually runs.
        onItemRemoved: function (itemView) {
            //console.log("itemView:", this, this.searchResultsBeingRemoved, this.deferredUnsubscribe);
            //this.searchResultsBeingRemoved.push(itemView);
            //this.debouncedUnsubscribe();
        },
        
        //  Debounce unsubscribing because it always comes in bulk and would rather unsubscribe 
        //  from all removed elements at the end rather than each one individually.
        //debouncedUnsubscribe: _.debounce(function () {
        //    var thumbnails = this.searchResultsBeingRemoved.map(function(searchResult) {
        //        return searchResult.ui.imageThumbnail;
        //    });

        //    LazyLoader.unsubscribe(this.ui.videoSearchResults, thumbnails);
            
        //    //  Cleanup searchResultBeingRemoved after unsubscribe has happened.
        //    this.searchResultsBeingRemoved.length = 0;
        //}, 500),

        onRender: function () {
            this.toggleBigText();
            this.toggleBottomMenubar();
            
            GenericForegroundView.prototype.initializeTooltips.call(this);
            MultiSelectCompositeView.prototype.onRender.apply(this, arguments);
        },
        
        initialize: function () {
            $(window).on('unload.videoSearch', this.onClose.bind(this));
            ForegroundViewManager.subscribe(this);
        },
        
        onShow: function () {
            //  By passing undefined in I opt to use the default duration length.
            var transitionDuration = this.model.get('doSnapAnimation') ? undefined : 0;
            
            this.$el.transition({
                x: this.$el.width()
            }, transitionDuration, 'snap', function () {
                
                //  Reset val after focusing to prevent selecting the text while maintaining focus.
                this.ui.searchInput.focus().val(this.ui.searchInput.val());
                chrome.extension.getBackgroundPage().stopClearResultsTimer();

                //var imageThumbnails = this.children.map(function(child) {
                //    return child.ui.imageThumbnail;
                //});

                //LazyLoader.showOrSubscribe(this.ui.videoSearchResults, imageThumbnails);

                this.model.set('isFullyVisible', true);
            }.bind(this));

        },

        //  This is ran whenever the user closes the video search view, but the foreground remains open.
        onClose: function () {
            $(window).off('unload.videoSearch');
            ForegroundViewManager.unsubscribe(this);
            
            this.model.saveSearchQuery();
            this.startClearResultsTimeout();
        },
        
        hide: function () {
            
            //  Transition the view back out before closing.
            this.$el.transition({
                //  Transition -20px off the screen to account for the shadow on the view.
                x: -20
            }, function () {
                this.model.destroy();
            }.bind(this));
            
        },
        
        //  Wait a while before forgetting search results because sometimes people just leave for a second and its frustrating to lose the results.
        //  But, if you've been gone away a while you don't want to have to clear your old stuff.
        startClearResultsTimeout: function () {
            //  It's important to write this to the background page because the foreground gets destroyed so it couldn't possibly remember it.
            chrome.extension.getBackgroundPage().startClearResultsTimer();
        },
        
        //  Searches youtube for video results based on the given text.
        search: function () {
            var searchQuery = $.trim(this.ui.searchInput.val());
            this.model.search(searchQuery);
        },
        
        toggleBottomMenubar: function () {
            
            if (this.collection.selected().length === 0) {
                this.ui.bottomMenubar.hide();
                this.ui.bigTextWrapper.addClass('extended');
            } else {
                this.ui.bottomMenubar.show();
                this.ui.bigTextWrapper.removeClass('extended');
            }
            
        },

        //  Set the visibility of any visible text messages.
        toggleBigText: function () {
            //  Hide the search message when there is no search in progress nor any typing happening.
            var isNotSearching = this.model.get('searchJqXhr') === null && !this.model.get('typing');

            this.ui.searchingMessage.toggleClass('hidden', isNotSearching);

            //  Hide the instructions message once user has searched or are searching.
            var hasSearchResults = this.collection.length > 0;
            var hasSearchQuery = this.model.get('searchQuery').length > 0;

            this.ui.instructions.toggleClass('hidden', hasSearchResults || hasSearchQuery);

            //  Only show no results when all other options are exhausted and user has interacted.
            var hasNoResults = isNotSearching && hasSearchQuery && !hasSearchResults;
            this.ui.noResultsMessage.toggleClass('hidden', !hasNoResults);
        },

        showContextMenu: function (event) {
            
            if (event.target === event.currentTarget || $(event.target).hasClass('big-text') || $(event.target).hasClass('i-4x')) {
                //  Didn't bubble up from a child -- clear groups.
                ContextMenuGroups.reset();
            }

            var selectedVideos = this.collection.getSelectedVideos();

            ContextMenuGroups.add({
                items: [{
                    text: chrome.i18n.getMessage('playSelected') + ' (' + selectedVideos.length + ')',
                    disabled: selectedVideos.length === 0,
                    onClick: function () {
                        StreamItems.addByVideos(selectedVideos, true);
                    }
                }, {
                    text: chrome.i18n.getMessage('enqueueSelected') + ' (' + selectedVideos.length + ')',
                    disabled: selectedVideos.length === 0,
                    onClick: function () {
                        StreamItems.addByVideos(selectedVideos, false);
                    }
                }]
            });
        },
        
        playSelected: function () {
            StreamItems.addByVideos(this.collection.getSelectedVideos(), true);
        },

        showSaveSelectedPrompt: function () {
            var saveVideosPromptView = new SaveVideosPromptView({
                videos: this.collection.getSelectedVideos()
            });
            saveVideosPromptView.fadeInAndShow();
        },
        
        //  Shake the view to bring attention to the fact that the view is already visible.
        shake: function() {
            this.$el.effect('shake');
        }

    });

    return VideoSearchView;
});