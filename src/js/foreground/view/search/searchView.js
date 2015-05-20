define(function(require) {
    'use strict';

    var SpinnerView = require('foreground/view/element/spinnerView');
    var SearchResultsView = require('foreground/view/search/searchResultsView');
    var SongsAction = require('foreground/model/song/songsAction');
    var SearchTemplate = require('text!template/search/search.html');

    var SearchView = Marionette.LayoutView.extend({
        id: 'search',
        className: 'leftPane flexColumn panel-content panel-content--uncolored u-fullHeight',
        template: _.template(SearchTemplate),

        templateHelpers: {
            searchMessage: chrome.i18n.getMessage('search'),
            saveAllMessage: chrome.i18n.getMessage('saveAll'),
            addAllMessage: chrome.i18n.getMessage('addAll'),
            playAllMessage: chrome.i18n.getMessage('playAll'),
            notSignedInMessage: chrome.i18n.getMessage('notSignedIn'),
            startTypingMessage: chrome.i18n.getMessage('startTyping'),
            resultsWillAppearAsYouSearchMessage: chrome.i18n.getMessage('resultsWillAppearAsYouSearch'),
            searchingMessage: chrome.i18n.getMessage('searching'),
            noResultsFoundMessage: chrome.i18n.getMessage('noResultsFound'),
            trySearchingForSomethingElseMessage: chrome.i18n.getMessage('trySearchingForSomethingElse')
        },

        regions: {
            searchResults: '[data-region=searchResults]',
            spinner: '[data-region=spinner]'
        },

        ui: {
            playAllButton: '[data-ui~=playAllButton]',
            saveAllButton: '[data-ui~=saveAllButton]',
            addAllButton: '[data-ui~=addAllButton]',
            searchingMessage: '[data-ui~=searchingMessage]',
            typeToSearchMessage: '[data-ui~=typeToSearchMessage]',
            noResultsMessage: '[data-ui~=noResultsMessage]'
        },

        events: {
            'click @ui.playAllButton': '_onClickPlayAllButton',
            'click @ui.addAllButton': '_onClickAddAllButton',
            'click @ui.saveAllButton': '_onClickSaveAllButton'
        },

        modelEvents: {
            'change:query': '_onChangeQuery',
            'change:searching': '_onChangeSearching'
        },

        collectionEvents: {
            'add:completed': '_onSearchResultsAddCompleted',
            'remove': '_onSearchResultsRemove',
            'reset': '_onSearchResultsReset'
        },

        transitionDuration: 4000,
        streamItems: null,
        signInManager: null,

        initialize: function(options) {
            this.streamItems = options.streamItems;
            this.signInManager = options.signInManager;

            this.listenTo(this.signInManager, 'change:signedInUser', this._onSignInManagerChangeSignedInUser);
            this.listenTo(Streamus.channels.search.commands, 'search', this._search);
        },

        onRender: function() {
            this._setButtonStates();
            this._toggleInstructions();

            this.showChildView('searchResults', new SearchResultsView({
                collection: this.model.get('results')
            }));

            this.showChildView('spinner', new SpinnerView());
        },

        //  onVisible is triggered when the element begins to transition into the viewport.
        onVisible: function() {
            this.model.stopClearQueryTimer();
        },

        _onClickSaveAllButton: function() {
            var canSave = this._canSave();

            if (canSave) {
                this._showSaveSelectedSimpleMenu();
            }
        },

        _onClickAddAllButton: function() {
            var canAdd = this._canPlayOrAdd();

            if (canAdd) {
                this.streamItems.addSongs(this.collection.getSongs());
            }
        },

        _onClickPlayAllButton: function() {
            var canPlay = this._canPlayOrAdd();

            if (canPlay) {
                this.streamItems.addSongs(this.collection.getSongs(), {
                    playOnAdd: true
                });
            }
        },

        _onSignInManagerChangeSignedInUser: function() {
            this._setSaveAllButtonState();
        },

        _onChangeSearching: function() {
            this._toggleInstructions();
        },

        _onChangeQuery: function() {
            this._toggleInstructions();
        },

        _onSearchResultsReset: function() {
            this._toggleInstructions();
            this._setButtonStates();
        },

        _onSearchResultsAddCompleted: function() {
            this._toggleInstructions();
            this._setButtonStates();
        },

        _onSearchResultsRemove: function() {
            this._toggleInstructions();
            this._setButtonStates();
        },

        //  Searches youtube for song results based on the given text.
        _search: function(options) {
            this.model.set('query', options.query);
        },

        _setSaveAllButtonState: function() {
            var canSave = this._canSave();
            this.ui.saveAllButton.toggleClass('is-disabled', !canSave);
        },

        _setButtonStates: function() {
            this._setSaveAllButtonState();

            var canPlayOrAdd = this._canPlayOrAdd();
            this.ui.playAllButton.toggleClass('is-disabled', !canPlayOrAdd);
            this.ui.addAllButton.toggleClass('is-disabled', !canPlayOrAdd);
        },

        _showSaveSelectedSimpleMenu: function() {
            var canSave = this._canSave();

            if (canSave) {
                var songsAction = new SongsAction({
                    songs: this.collection.getSongs()
                });

                var offset = this.ui.saveAllButton.offset();
                var playlists = this.signInManager.get('signedInUser').get('playlists');

                songsAction.showSaveMenu(offset.top, offset.left, playlists);
            }
        },

        _canSave: function() {
            var signedIn = this.signInManager.get('signedInUser') !== null;
            var isEmpty = this.collection.isEmpty();

            return signedIn && !isEmpty;
        },

        _canPlayOrAdd: function() {
            var isEmpty = this.collection.isEmpty();

            return !isEmpty;
        },

        //  Set the visibility of any visible text messages.
        _toggleInstructions: function() {
            var hasSearchResults = this.collection.length > 0;

            //  Hide the search message when there is no search in progress
            //  If the search is in progress and the first 50 results have already been returned, also hide the message.
            var searching = this.model.get('searching');
            this.ui.searchingMessage.toggleClass('is-hidden', !searching || hasSearchResults);

            //  Hide the type to search message once user has typed something.
            var hasSearchQuery = this.model.hasQuery();
            this.ui.typeToSearchMessage.toggleClass('is-hidden', hasSearchQuery);

            //  Only show no results when all other options are exhausted and user has interacted.
            var hideNoResults = hasSearchResults || searching || !hasSearchQuery;
            this.ui.noResultsMessage.toggleClass('is-hidden', hideNoResults);
        }
    });

    return SearchView;
});