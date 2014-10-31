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
        className: 'leftPane column column--wide u-flex--column panel panel--left panel--uncolored u-transitionable',
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
            'input @ui.searchInput': '_onInputSearchInput',
            'click @ui.hideSearchButton': '_onClickHideSearchButton',
            'click @ui.playSelectedButton:not(.disabled)': '_onClickPlaySelectedButton',
            'click @ui.addSelectedButton:not(.disabled)': '_onClickAddSelectedButton',
            'click @ui.saveSelectedButton:not(.disabled)': '_onClickSaveSelectedButton'
        },

        modelEvents: {
            'change:query': '_onChangeQuery',
            'change:searching': '_onChangeSearching'
        },

        collectionEvents: {
            'reset': '_onCollectionReset',
            'change:selected': '_onCollectionChangeSelected'
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
                notSignedInMessage: chrome.i18n.getMessage('notSignedIn')
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
        
        transitionDuration: 300,
        streamItems: null,
        signInManager: null,
        visible: false,

        initialize: function () {
            this.streamItems = Streamus.backgroundPage.stream.get('items');
            this.signInManager = Streamus.backgroundPage.signInManager;

            this.listenTo(this.signInManager, 'change:signedInUser', this._toggleSaveSelected);
        },
 
        onRender: function () {
            this._toggleInstructions();
            this._toggleSelectedButtons();
        },

        show: function (transitionIn) {
            this.visible = true;
            this.$el.addClass('is-visible');

            this.model.stopClearQueryTimer();
            this.focusInput();

            this.$el.transition({
                x: 0
            }, {
                easing: 'easeOutCubic',
                duration: transitionIn ? this.transitionDuration : 0
            });
        },
        
        //  Reset val after focusing to prevent selecting the text while maintaining focus.
        focusInput: function () {
            this.ui.searchInput.focus().val(this.ui.searchInput.val());
        },
        
        _onChangeSearching: function () {
            this._toggleInstructions();
        },
        
        _onChangeQuery: function (model, query) {
            this.ui.searchInput.val(query);
            this._toggleInstructions();
        },
        
        _onCollectionReset: function () {
            this._toggleInstructions();
        },
        
        _onCollectionChangeSelected: function () {
            this._toggleSelectedButtons();
        },

        _onClickSaveSelectedButton: function() {
            this._showSaveSelectedPrompt();
        },
        
        _onClickAddSelectedButton: function () {
            this._addSelected();
        },
        
        _onClickPlaySelectedButton: function () {
            this._playSelected();
        },
        
        _onClickHideSearchButton: function () {
            this._hide();
        },
        
        _onInputSearchInput: function () {
            this._search();
        },
        
        _hide: function () {
            //  Transition the view back out before closing.
            this.$el.transition({
                x: '-100%'
            }, {
                easing: 'easeOutCubic',
                duration: this.transitionDuration,
                complete: this._onHideComplete.bind(this)
            });
        },
        
        _onHideComplete: function () {
            this.visible = false;
            this.$el.removeClass('is-visible');
        },
        
        //  Searches youtube for song results based on the given text.
        _search: function () {
            var query = this.ui.searchInput.val();
            this.model.set('query', query);
        },
        
        _toggleSaveSelected: function () {
            var signedOut = this.signInManager.get('signedInUser') === null;
            var noResultsSelected = this.collection.selected().length === 0;
            this.ui.saveSelectedButton.toggleClass('disabled', signedOut || noResultsSelected);
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
        
        _toggleSelectedButtons: function () {
            this._toggleSaveSelected();
            var noResultsSelected = this.collection.selected().length === 0;
            this.ui.playSelectedButton.toggleClass('disabled', noResultsSelected);
            this.ui.addSelectedButton.toggleClass('disabled', noResultsSelected);
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