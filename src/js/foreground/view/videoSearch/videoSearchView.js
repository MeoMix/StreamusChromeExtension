define([
    'foreground/view/multiSelectCompositeView',
    'text!template/videoSearch.html',
    'foreground/view/videoSearch/videoSearchResultView',
    'foreground/view/prompt/saveVideosPromptView',
    'background/model/user',
    'background/collection/streamItems'
], function (MultiSelectCompositeView, VideoSearchTemplate, VideoSearchResultView, SaveVideosPromptView, User, StreamItems) {
    'use strict';
    
    var VideoSearchView = MultiSelectCompositeView.extend({

        id: 'videoSearch',
        className: 'left-pane',
        
        template: _.template(VideoSearchTemplate),
        itemViewContainer: '#videoSearchResults',
        
        itemView: VideoSearchResultView,
        
        ui: {
            bottomMenubar: '.left-bottom-menubar',
            searchInput: '.searchBar input',
            searchingMessage: 'div.searching',
            instructions: 'div.instructions',
            noResultsMessage: 'div.noResults',
            bigTextWrapper: 'div.big-text-wrapper',
            itemContainer: '#videoSearchResults',
            saveSelectedButton: 'button#saveSelected'
        },
        
        events: _.extend({}, MultiSelectCompositeView.prototype.events, {
            'input @ui.searchInput': 'search',
            'click button#hideVideoSearch': 'hide',
            'contextmenu @ui.itemContainer': 'showContextMenu',
            'click button#playSelected': 'playSelected',
            'click button#addSelected': 'addSelected',
            'click @ui.saveSelectedButton': 'showSaveSelectedPrompt'
        }),
 
        templateHelpers: function() {
            return {
                saveSelectedMessage: chrome.i18n.getMessage('saveSelected'),
                addSelectedMessage: chrome.i18n.getMessage('addSelected'),
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
 
        onRender: function () {
            this.toggleBigText();
            this.toggleBottomMenubar();
            this.toggleSaveSelected();
            
            this.applyTooltips();
            MultiSelectCompositeView.prototype.onRender.apply(this, arguments);
        },
        
        initialize: function () {
            this.listenTo(User, 'change:signedIn', this.toggleSaveSelected);
        },
        
        onShow: function () {
            chrome.extension.getBackgroundPage().stopClearResultsTimer();
            
            //  Reset val after focusing to prevent selecting the text while maintaining focus.
            this.ui.searchInput.focus().val(this.ui.searchInput.val());

            //  By passing undefined in I opt to use the default duration length.
            var transitionDuration = this.model.get('doSnapAnimation') ? undefined : 0;

            this.$el.transition({
                x: this.$el.width()
            }, transitionDuration, 'snap', this.onFullyVisible.bind(this));
        },

        //  This is ran whenever the user closes the video search view, but the foreground remains open.
        onClose: function () {
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
            var userSignedIn = User.get('signedIn');

            this.ui.saveSelectedButton.toggleClass('disabled', !userSignedIn);

            var templateHelpers = this.templateHelpers();
            this.ui.saveSelectedButton.attr('title', userSignedIn ? templateHelpers.saveSelectedMessage : templateHelpers.cantSaveNotSignedInMessage);
        },
        
        toggleBottomMenubar: function () {
            var selectedCount = this.collection.selected().length;

            this.ui.bottomMenubar.toggle(selectedCount > 0);
            this.ui.bigTextWrapper.toggleClass('extended', selectedCount === 0);
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
        
        playSelected: function () {
            StreamItems.addByVideos(this.collection.getSelectedVideos(), true);
        },
        
        addSelected: function() {
            StreamItems.addByVideos(this.collection.getSelectedVideos(), false);
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