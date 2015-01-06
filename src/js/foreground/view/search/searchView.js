define([
    'foreground/view/element/spinnerView',
    'foreground/view/prompt/saveSongsPromptView',
    'foreground/view/search/searchResultsView',
    'text!template/search/search.html'
], function (SpinnerView, SaveSongsPromptView, SearchResultsView, SearchTemplate) {
    'use strict';

    var SearchView = Marionette.LayoutView.extend({
        id: 'search',
        className: 'leftPane column u-flex--column u-flex--full panel-content panel-content--uncolored',
        template: _.template(SearchTemplate),
        
        templateHelpers: function () {
            return {
                viewId: this.id,
                searchMessage: chrome.i18n.getMessage('search'),
                saveMessage: chrome.i18n.getMessage('save'),
                addMessage: chrome.i18n.getMessage('add'),
                playMessage: chrome.i18n.getMessage('play'),
                notSignedInMessage: chrome.i18n.getMessage('notSignedIn'),
                startTypingMessage: chrome.i18n.getMessage('startTyping'),
                resultsWillAppearAsYouSearchMessage: chrome.i18n.getMessage('resultsWillAppearAsYouSearch'),
                searchingMessage: chrome.i18n.getMessage('searching'),
                noResultsFoundMessage: chrome.i18n.getMessage('noResultsFound'),
                sorryAboutThatMessage: chrome.i18n.getMessage('sorryAboutThat'),
                trySearchingForSomethingElseMessage: chrome.i18n.getMessage('trySearchingForSomethingElse')
            };
        },

        regions: function () {
            return {
                searchResultsRegion: '#' + this.id + '-searchResultsRegion',
                spinnerRegion: '#' + this.id + '-spinnerRegion'
            };
        },
        
        ui: function () {
            return {
                playSelectedButton: '#' + this.id + '-playSelectedButton',
                saveSelectedButton: '#' + this.id + '-saveSelectedButton',
                addSelectedButton: '#' + this.id + '-addSelectedButton',
                searchingMessage: '#' + this.id + '-searchingMessage',
                typeToSearchMessage: '#' + this.id + '-typeToSearchMessage',
                noResultsMessage: '#' + this.id + '-noResultsMessage'
            };
        },
        
        events: {
            'click @ui.playSelectedButton:not(.disabled)': '_onClickPlaySelectedButton',
            'click @ui.addSelectedButton:not(.disabled)': '_onClickAddSelectedButton',
            'click @ui.saveSelectedButton:not(.disabled)': '_onClickSaveSelectedButton'
        },

        modelEvents: {
            'change:query': '_onChangeQuery',
            'change:searching': '_onChangeSearching'
        },

        collectionEvents: {
            'change:selected': '_onSearchResultsChangeSelected'
        },
        
        transitionDuration: 4000,
        streamItems: null,
        signInManager: null,

        initialize: function () {
            this.streamItems = Streamus.backgroundPage.stream.get('items');
            this.signInManager = Streamus.backgroundPage.signInManager;

            this.listenTo(this.signInManager, 'change:signedInUser', this._onSignInManagerChangeSignedInUser);
            this.listenTo(Streamus.channels.searchArea.commands, 'search', this._search);

            var searchResults = this.model.get('results');

            this.listenTo(searchResults, 'add', this._onSearchResultsAdd);
            this.listenTo(searchResults, 'remove', this._onSearchResultsRemove);
            this.listenTo(searchResults, 'reset', this._onSearchResultsReset);
        },
 
        onRender: function () {
            this._toggleSelectedButtons();
            this._toggleInstructions();
        },
        
        onShow: function () {
            this.searchResultsRegion.show(new SearchResultsView({
                //  TODO: SearchResultsView shouldn't have to be dependent on model
                model: this.model,
                collection: this.model.get('results')
            }));
            
            this.spinnerRegion.show(new SpinnerView());
        },
        
        //  onVisible is triggered when the element begins to transition into the viewport.
        onVisible: function () {
            this.model.stopClearQueryTimer();
        },
        
        _onSearchResultsChangeSelected: function () {
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
        
        _onSignInManagerChangeSignedInUser: function() {
            this._toggleSaveSelected();
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

        //  Searches youtube for song results based on the given text.
        _search: function (options) {
            this.model.set('query', options.query);
        },

        _toggleSaveSelected: function () {
            var signedOut = this.signInManager.get('signedInUser') === null;
            var noResultsSelected = this.collection.selected().length === 0;
            this.ui.saveSelectedButton.toggleClass('disabled', signedOut || noResultsSelected);
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

        _addSelected: function () {
            this.streamItems.addSongs(this.collection.getSelectedSongs());
        },

        _showSaveSelectedPrompt: function () {
            var disabled = this.ui.saveSelectedButton.hasClass('disabled');

            if (!disabled) {
                Streamus.channels.prompt.commands.trigger('show:prompt', SaveSongsPromptView, {
                    songs: this.collection.getSelectedSongs()
                });
            }
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

    return SearchView;
});