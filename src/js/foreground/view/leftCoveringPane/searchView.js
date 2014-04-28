define([
    'foreground/eventAggregator',
    'foreground/view/multiSelectCompositeView',
    'foreground/view/leftCoveringPane/searchResultView',
    'foreground/view/prompt/saveSongsPromptView',
    'text!template/search.html'
], function (EventAggregator, MultiSelectCompositeView, SearchResultView, SaveSongsPromptView, SearchTemplate) {
    'use strict';

    var StreamItems = chrome.extension.getBackgroundPage().StreamItems;
    var User = chrome.extension.getBackgroundPage().User;
    
    var SearchView = MultiSelectCompositeView.extend({

        id: 'search',
        className: 'left-pane',
        
        template: _.template(SearchTemplate),
        itemViewContainer: '#search-results',
        
        itemView: SearchResultView,
        
        //  TODO: Fix hardcoding this.. tricky because items are added before onShow and onShow is when the viewportHeight is able to be determined.
        viewportHeight: 350,
        
        ui: _.extend({}, MultiSelectCompositeView.prototype.ui, {
            bottomMenubar: '.left-bottom-menubar',
            searchInput: '.search-bar input',
            searchingMessage: '.searching',
            instructions: '.instructions',
            noResultsMessage: '.no-results',
            bigTextWrapper: '.big-text-wrapper',
            itemContainer: '#search-results',
            saveSelectedButton: '#save-selected',
            hideSearchButton: '#hide-search',
            playSelectedButton: '#play-selected',
            addSelectedButton: '#add-selected'
        }),
        
        events: _.extend({}, MultiSelectCompositeView.prototype.events, {
            'input @ui.searchInput': 'search',
            'click @ui.hideSearchButton': 'hide',
            'contextmenu @ui.itemContainer': 'showContextMenu',
            'click @ui.playSelectedButton': 'playSelected',
            'click @ui.addSelectedButton': 'addSelected',
            'click @ui.saveSelectedButton': 'showSaveSelectedPrompt'
        }),
        
        modelEvents: {
            'change:searchJqXhr change:searchQuery change:typing': 'toggleBigText'
        },

        //  TODO: Extend collectionEvents on playlist and stream.
        collectionEvents: _.extend({}, MultiSelectCompositeView.prototype.collectionEvents, {
            'reset': function () {
                this.toggleBigText();
                this._reset();
            },
            'change:selected': 'toggleBottomMenubar'
        }),
 
        templateHelpers: function() {
            return {
                saveSelectedMessage: chrome.i18n.getMessage('saveSelected'),
                addSelectedMessage: chrome.i18n.getMessage('addSelected'),
                playSelectedMessage: chrome.i18n.getMessage('playSelected'),
                searchMessage: chrome.i18n.getMessage('search'),
                hideSearchMessage: chrome.i18n.getMessage('hideSearch'),
                startTypingMessage: chrome.i18n.getMessage('startTyping'),
                resultsWillAppearAsYouSearchMessage: chrome.i18n.getMessage('resultsWillAppearAsYouSearch'),
                searchingMessage: chrome.i18n.getMessage('searching'),
                noResultsFoundMessage: chrome.i18n.getMessage('noResultsFound'),
                sorryAboutThatMessage: chrome.i18n.getMessage('sorryAboutThat'),
                trySearchingForSomethingElseMessage: chrome.i18n.getMessage('trySearchingForSomethingElse'),
                cantSaveNotSignedInMessage: chrome.i18n.getMessage('cantSaveNotSignedIn')
            };
        },
 
        onRender: function () {
            this.toggleBigText();
            this.toggleBottomMenubar();
            this.toggleSaveSelected();

            MultiSelectCompositeView.prototype.onRender.apply(this, arguments);
        },
        
        initialize: function () {
            this.listenTo(User, 'change:signedIn', this.toggleSaveSelected);

            //  TODO: Push this back down onto the child I think since I render fewer.
            this.on('composite:collection:rendered', function () {
                this.children.each(function (child) {
                    child.setTitleTooltip(child.ui.title);
                });
            });

            MultiSelectCompositeView.prototype.initialize.apply(this, arguments);
        },
        
        onShow: function () {
            chrome.extension.getBackgroundPage().window.stopClearResultsTimer();
            
            //  Reset val after focusing to prevent selecting the text while maintaining focus.
            this.ui.searchInput.focus().val(this.ui.searchInput.val());

            //  By passing undefined in I opt to use the default duration length.
            var transitionDuration = this.model.get('doSnapAnimation') ? undefined : 0;

            this.$el.transition({
                x: this.$el.width()
            }, transitionDuration, 'snap', function() {
                this.onFullyVisible();
                
                this.children.each(function (child) {
                    child.setTitleTooltip(child.ui.title);
                });

                this.ui.hideSearchButton.qtip();
                this.ui.playSelectedButton.qtip();
                this.ui.addSelectedButton.qtip();
                this.ui.saveSelectedButton.qtip();
            }.bind(this));
           
        },

        //  This is ran whenever the user closes the search view, but the foreground remains open.
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
        
        //  Searches youtube for song results based on the given text.
        search: function () {
            var searchQuery = $.trim(this.ui.searchInput.val());
            this.model.search(searchQuery);

            //  Reset the list's scroll position to the top.
            this.ui.list[0].scrollTop = 0;
            
            //  TODO: Waaay too manual.
            this.minRenderIndex = this._getMinRenderIndex(0);
            this.maxRenderIndex = this._getMaxRenderIndex(0);

            this._setPaddingTop();
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
            StreamItems.addSongs(this.collection.getSelectedSongs(), {
                playOnAdd: true
            });
        },
        
        addSelected: function() {
            StreamItems.addSongs(this.collection.getSelectedSongs());
        },

        showSaveSelectedPrompt: function () {

            var disabled = this.ui.saveSelectedButton.hasClass('disabled');
            
            if (!disabled) {

                EventAggregator.trigger('showPrompt', new SaveSongsPromptView({
                    songs: this.collection.getSelectedSongs()
                }));
                
            }
            //  Don't close the menu if disabled
            return !disabled;
        },
        
        //  Shake the view to bring attention to the fact that the view is already visible.
        shake: function() {
            this.$el.effect('shake');
        }

    });

    return SearchView;
});