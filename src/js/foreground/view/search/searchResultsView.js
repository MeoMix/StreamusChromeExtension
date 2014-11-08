define([
    'common/enum/listItemType',
    'foreground/view/behavior/collectionViewMultiSelect',
    'foreground/view/behavior/slidingRender',
    'foreground/view/behavior/sortable',
    'foreground/view/behavior/tooltip',
    'foreground/view/search/searchResultView',
    'text!template/search/searchResults.html'
], function (ListItemType, CollectionViewMultiSelect, SlidingRender, Sortable, Tooltip, SearchResultView, SearchResultsTemplate) {
    'use strict';

    var SearchResultsView = Backbone.Marionette.CompositeView.extend({
        id: 'searchResults',
        className: 'column u-flex--column u-flex--full',
        childViewContainer: '@ui.childContainer',
        childView: SearchResultView,
        childViewOptions: {
            type: ListItemType.SearchResult
        },

        //  Overwrite resortView to only render children as expected
        resortView: function () {
            this._renderChildren();
        },
        
        template: _.template(SearchResultsTemplate),
        templateHelpers: {
            startTypingMessage: chrome.i18n.getMessage('startTyping'),
            resultsWillAppearAsYouSearchMessage: chrome.i18n.getMessage('resultsWillAppearAsYouSearch'),
            searchingMessage: chrome.i18n.getMessage('searching'),
            noResultsFoundMessage: chrome.i18n.getMessage('noResultsFound'),
            sorryAboutThatMessage: chrome.i18n.getMessage('sorryAboutThat'),
            trySearchingForSomethingElseMessage: chrome.i18n.getMessage('trySearchingForSomethingElse')
        },

        ui: {
            searchingMessage: '#searchResults-searchingMessage',
            typeToSearchMessage: '#searchResults-typeToSearchMessage',
            noResultsMessage: '#searchResults-noResultsMessage',
            childContainer: '#searchResults-listItems'
        },
        
        modelEvents: {
            'change:query': '_onChangeQuery',
            'change:searching': '_onChangeSearching'
        },
        
        collectionEvents: {
            'add': '_onSearchResultsAdd',
            'remove': '_onSearchResultsRemove',
            'reset': '_onSearchResultsReset'
        },
        
        behaviors: {
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
        },
        
        onRender: function() {
            this._toggleInstructions();
        },
        
        _onChangeSearching: function () {
            this._toggleInstructions();
        },

        _onChangeQuery: function () {
            this._toggleInstructions();
        },

        _onSearchResultsReset: function () {
            this._toggleInstructions();
        },
        
        _onSearchResultsAdd: function () {
            this._toggleInstructions();
        },
        
        _onSearchResultsRemove: function () {
            this._toggleInstructions();
        },

        //  Set the visibility of any visible text messages.
        _toggleInstructions: function () {
            var hasSearchResults = this.collection.length > 0;

            //  Hide the search message when there is no search in progress
            //  If the search is in progress and the first 50 results have already been returned, also hide the message.
            var searching = this.model.get('searching');
            this.ui.searchingMessage.toggleClass('hidden', !searching || hasSearchResults);

            //  Hide the type to search message once user has typed something.
            var hasSearchQuery = this.model.hasQuery();
            this.ui.typeToSearchMessage.toggleClass('hidden', hasSearchQuery);

            //  Only show no results when all other options are exhausted and user has interacted.
            var hideNoResults = hasSearchResults || searching || !hasSearchQuery;
            this.ui.noResultsMessage.toggleClass('hidden', hideNoResults);
        }
    });

    return SearchResultsView;
});