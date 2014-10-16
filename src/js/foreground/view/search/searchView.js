define([
    'common/enum/listItemType',
    'foreground/view/behavior/collectionViewMultiSelect',
    'foreground/view/behavior/slidingRender',
    'foreground/view/behavior/sortable',
    'foreground/view/behavior/tooltip',
    'foreground/view/prompt/saveSongsPromptView',
    'foreground/view/search/searchResultView',
    'text!template/search/search.html'
], function (ListItemType, CollectionViewMultiSelect, SlidingRender, Sortable, Tooltip, SaveSongsPromptView, SearchResultView, SearchTemplate) {
    'use strict';

    var SearchView = Backbone.Marionette.CompositeView.extend({
        id: 'search',
        className: 'leftPane column column--fullWidth u-flex--column panel panel--left panel--uncolored',
        template: _.template(SearchTemplate),
        childViewContainer: '@ui.childContainer',
        childView: SearchResultView,
        
        //  Overwrite resortView to only render children as expected
        resortView: function () {
            this._renderChildren();
        },
        
        childViewOptions: {
            type: ListItemType.SearchResult
        },
        
        ui: {
            bottomContentBar: '#search-bottomContentBar',
            searchInput: '#search-searchInput',
            searchingMessage: '#search-searchingMessage',
            typeToSearchMessage: '#search-typeToSearchMessage',
            noResultsMessage: '#search-noResultsMessage',
            childContainer: '#search-listItems',
            hideSearchButton: '#search-hideSearchButton',
            playSelectedButton: '#search-playSelectedButton',
            saveSelectedButton: '#search-saveSelectedButton',
            addSelectedButton: '#search-addSelectedButton'
        },
        
        events: {
            'input @ui.searchInput': '_search',
            'click @ui.hideSearchButton': '_hide',
            'contextmenu @ui.childContainer': '_showContextMenu',
            'click @ui.playSelectedButton': '_playSelected',
            'click @ui.addSelectedButton': '_addSelected',
            'click @ui.saveSelectedButton': '_showSaveSelectedPrompt'
        },
        
        modelEvents: {
            'change:query change:searching': '_toggleInstructions'
        },

        collectionEvents: {
            'reset': '_toggleInstructions',
            'change:selected': '_toggleBottomContentBar'
        },
 
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
        
        behaviors: function() {
            return {
                CollectionViewMultiSelect: {
                    behaviorClass: CollectionViewMultiSelect
                },
                SlidingRender: {
                    behaviorClass: SlidingRender
                },
                Sortable: {
                    behaviorClass: Sortable
                },
                Tooltip: {
                    behaviorClass: Tooltip
                }
            };
        },
        
        doSnapAnimation: false,
        streamItems: null,
        signInManager: null,

        initialize: function (options) {
            this.doSnapAnimation = options.doSnapAnimation;
            this.streamItems = Streamus.backgroundPage.StreamItems;
            this.signInManager = Streamus.backgroundPage.SignInManager;

            this.listenTo(this.signInManager, 'change:signedIn', this._toggleSaveSelected);
        },
 
        onRender: function () {
            this._toggleInstructions();
            this._toggleBottomContentBar();
            this._toggleSaveSelected();
        },
        
        onShow: function () {
            this.model.stopClearQueryTimer();
            this.focusInput();
            
            //  By passing undefined in I opt to use the default duration length.
            var transitionDuration = this.doSnapAnimation ? undefined : 0;

            this.$el.transition({
                x: 0
            }, transitionDuration, 'snap');
        },

        onBeforeDestroy: function () {
            //  Remember search query for a bit just in case user close/re-open quickly, no need to re-search.
            this.model.startClearQueryTimer();
        },
        
        //  Reset val after focusing to prevent selecting the text while maintaining focus.
        focusInput: function () {
            this.ui.searchInput.focus().val(this.ui.searchInput.val());
        },
        
        _hide: function () {
            //  Transition the view back out before closing.
            this.$el.transition({
                /* Go beyond -100% for the translate in order to hide the drop shadow skirting the border of the box model. */
                x: '-102%'
            }, this.destroy.bind(this));
        },
        
        //  Searches youtube for song results based on the given text.
        _search: function () {
            var query = this.ui.searchInput.val();
            this.model.set('query', query);
        },
        
        _toggleSaveSelected: function () {
            var signedIn = this.signInManager.get('signedIn');
            this.ui.saveSelectedButton.toggleClass('disabled', !signedIn);

            var templateHelpers = this.templateHelpers();
            this.ui.saveSelectedButton.attr('title', signedIn ? templateHelpers.saveSelectedMessage : templateHelpers.cantSaveNotSignedInMessage);
        },
        
        _toggleBottomContentBar: function () {
            var selectedCount = this.collection.selected().length;
            this.ui.bottomContentBar.toggleClass('hidden', selectedCount === 0);

            //  Need to update viewportHeight in slidingRender behavior:
            this.triggerMethod('ListHeightUpdated');
        },

        //  Set the visibility of any visible text messages.
        _toggleInstructions: function () {
            //  Hide the search message when there is no search in progress.
            var searching = this.model.get('searching');
            this.ui.searchingMessage.toggleClass('hidden', !searching);
    
            //  Hide the type to search message once user has typed something.
            var hasSearchQuery = this.model.hasQuery();
            this.ui.typeToSearchMessage.toggleClass('hidden', hasSearchQuery);

            //  Only show no results when all other options are exhausted and user has interacted.
            var hasSearchResults = this.collection.length > 0;
            var hideNoResults = hasSearchResults || searching || !hasSearchQuery;
            this.ui.noResultsMessage.toggleClass('hidden', hideNoResults);
        },
        
        _playSelected: function () {
            this.streamItems.addSongs(this.collection.getSelectedSongs(), {
                playOnAdd: true
            });
        },
        
        _addSelected: function() {
            this.streamItems.addSongs(this.collection.getSelectedSongs());
        },

        _showSaveSelectedPrompt: function () {
            var disabled = this.ui.saveSelectedButton.hasClass('disabled');
            
            if (!disabled) {
                Streamus.channels.prompt.commands.trigger('show:prompt', SaveSongsPromptView, {
                    songs: this.collection.getSelectedSongs()
                });
            }
            //  Don't close the menu if disabled
            return !disabled;
        }
    });

    return SearchView;
});