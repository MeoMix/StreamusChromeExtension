define([
    'foreground/view/genericForegroundView',
    'foreground/view/multiSelectCompositeView',
    'foreground/model/foregroundViewManager',
    'text!template/videoSearch.html',
    'foreground/view/videoSearch/videoSearchResultView',
    'foreground/collection/contextMenuGroups',
    'foreground/view/prompt/saveVideosPromptView',
    'foreground/model/user',
    'foreground/collection/streamItems'
], function (GenericForegroundView, MultiSelectCompositeView, ForegroundViewManager, VideoSearchTemplate, VideoSearchResultView, ContextMenuGroups, SaveVideosPromptView, User, StreamItems) {
    'use strict';
    
    var VideoSearchView = MultiSelectCompositeView.extend({

        id: 'videoSearch',
        className: 'left-pane',
        
        template: _.template(VideoSearchTemplate),
        itemViewContainer: '#videoSearchResults',
        
        isFullyVisible: true,
        
        itemView: VideoSearchResultView,
        
        ui: {
            bottomMenubar: '.left-bottom-menubar',
            searchInput: '.searchBar input',
            searchingMessage: 'div.searching',
            instructions: 'div.instructions',
            //  TODO: This could be handled by a Marionette.CollectionView's empty html.
            noResultsMessage: 'div.noResults',
            bigTextWrapper: 'div.big-text-wrapper',
            multiSelectItemContainer: '#videoSearchResults',
            saveSelectedButton: 'button#saveSelected'
        },
        
        events: _.extend({}, MultiSelectCompositeView.prototype.events, {
            'input @ui.searchInput': 'search',
            'click button#hideVideoSearch': 'hide',
            'contextmenu @ui.multiSelectItemContainer': 'showContextMenu',
            'click button#playSelected': 'playSelected',
            'click @ui.saveSelectedButton': 'showSaveSelectedPrompt'
        }),
 
        templateHelpers: function() {
            return {
                saveSelectedMessage: chrome.i18n.getMessage('saveSelected'),
                playSelectedMessage: chrome.i18n.getMessage('playSelected'),
                searchMessage: chrome.i18n.getMessage('search'),
                hideVideoSearchMessage: chrome.i18n.getMessage('hideVideoSearch'),
                startTypingMessage: chrome.i18n.getMessage('startTyping'),
                resultsWillAppearAsYouSearchMessage: chrome.i18n.getMessage('resultsWillAppearAsYouSearch'),
                searchingMessage: chrome.i18n.getMessage('searching'),
                noResultsFoundMessage: chrome.i18n.getMessage('noResultsFound'),
                sorryAboutThatMessage: chrome.i18n.getMessage('sorryAboutThat'),
                trySearchingForSomethingElseMessage: chrome.i18n.getMessage('trySearchingForSomethingElse'),
                cantSaveNotSignedInMessage: chrome.i18n.getMessage('cantSaveNotSignedIn')
                
            };
        },
        
        modelEvents: {
            'change:searchJqXhr change:searchQuery change:typing': 'toggleBigText'
        },

        collectionEvents: {
            'reset': 'toggleBigText',
            'change:selected': 'toggleBottomMenubar'
        },

        onAfterItemAdded: function (view) {
            if (this.isFullyVisible) {
                view.ui.imageThumbnail.lazyload({
                    container: this.ui.streamItems,
                    threshold: 250
                });
            }
        },
 
        onRender: function () {
            console.log('onRender being called');
            this.toggleBigText();
            this.toggleBottomMenubar();
            this.toggleSaveSelected();
            
            GenericForegroundView.prototype.initializeTooltips.call(this);
            MultiSelectCompositeView.prototype.onRender.apply(this, arguments);
        },
        
        initialize: function () {
            $(window).on('unload.videoSearch', this.onClose.bind(this));
            ForegroundViewManager.subscribe(this);
            this.listenTo(User, 'change:loaded', this.toggleSaveSelected);
        },
        
        onShow: function () {

            chrome.extension.getBackgroundPage().stopClearResultsTimer();
            
            //  Reset val after focusing to prevent selecting the text while maintaining focus.
            this.ui.searchInput.focus().val(this.ui.searchInput.val());

            //  By passing undefined in I opt to use the default duration length.
            var transitionDuration = this.model.get('doSnapAnimation') ? undefined : 0;

            this.$el.transition({
                x: this.$el.width()
            }, transitionDuration, 'snap', function () {
                
                //  TODO: This is copy/pasted from streamView, FIX!
                $(this.children.map(function (child) {
                    return child.ui.imageThumbnail.toArray();
                })).lazyload({
                    container: this.ui.streamItems,
                    threshold: 250
                });

                this.isFullyVisible = true;

            }.bind(this));

            //MultiSelectCompositeView.prototype.onShow.apply(this, arguments);
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
        
        toggleSaveSelected: function () {
            var userLoaded = User.get('loaded');

            this.ui.saveSelectedButton.toggleClass('disabled', !userLoaded);

            var templateHelpers = this.templateHelpers();

            console.log("userLoaded and templateHelpers", userLoaded, templateHelpers);
            this.ui.saveSelectedButton.attr('title', userLoaded ? templateHelpers.saveSelectedMessage : templateHelpers.cantSaveNotSignedInMessage);
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

            console.log("This.ui.searchingMessage:", this.ui.searchingMessage);

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

            console.log("Showing context menu");
            
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

            var disabled = this.ui.saveSelectedButton.hasClass('disabled');
            
            if (!disabled) {
                var saveVideosPromptView = new SaveVideosPromptView({
                    videos: this.collection.getSelectedVideos()
                });
                saveVideosPromptView.fadeInAndShow();
            }
            //  Don't close the menu if disabled
            return !disabled;
        },
        
        //  Shake the view to bring attention to the fact that the view is already visible.
        shake: function() {
            this.$el.effect('shake');
        }

    });

    return VideoSearchView;
});