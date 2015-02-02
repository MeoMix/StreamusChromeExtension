define(function (require) {
    'use strict';

    var SpinnerView = require('foreground/view/element/spinnerView');
    var SearchResultsView = require('foreground/view/search/searchResultsView');
    var SearchTemplate = require('text!template/search/search.html');

    //  TODO: I feel like this should be called searchResultsArea
    var SearchView = Marionette.LayoutView.extend({
        id: 'search',
        className: 'leftPane flexColumn panel-content panel-content--uncolored',
        template: _.template(SearchTemplate),
        
        templateHelpers: function () {
            return {
                viewId: this.id,
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
                playAllButton: '#' + this.id + '-playAllButton',
                saveAllButton: '#' + this.id + '-saveAllButton',
                addAllButton: '#' + this.id + '-addAllButton',
                searchingMessage: '#' + this.id + '-searchingMessage',
                typeToSearchMessage: '#' + this.id + '-typeToSearchMessage',
                noResultsMessage: '#' + this.id + '-noResultsMessage'
            };
        },
        
        events: {
            //  TODO: Quit checking class like this.
            'click @ui.playAllButton:not(.is-disabled)': '_onClickPlayAllButton',
            'click @ui.addAllButton:not(.is-disabled)': '_onClickAddAllButton',
            'click @ui.saveAllButton:not(.is-disabled)': '_onClickSaveAllButton'
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
        
        transitionDuration: 4000,
        streamItems: null,
        signInManager: null,

        initialize: function () {
            this.streamItems = Streamus.backgroundPage.stream.get('items');
            this.signInManager = Streamus.backgroundPage.signInManager;

            this.listenTo(this.signInManager, 'change:signedInUser', this._onSignInManagerChangeSignedInUser);
            this.listenTo(Streamus.channels.searchArea.commands, 'search', this._search);
        },
 
        onRender: function () {
            this._setButtonStates();
            this._toggleInstructions();
            
            this.searchResultsRegion.show(new SearchResultsView({
                collection: this.model.get('results')
            }));
            
            this.spinnerRegion.show(new SpinnerView());
        },
        
        //  onVisible is triggered when the element begins to transition into the viewport.
        onVisible: function () {
            this.model.stopClearQueryTimer();
        },

        _onClickSaveAllButton: function() {
            this._showSaveSelectedSimpleMenu();
        },
        
        _onClickAddAllButton: function () {
            this.streamItems.addSongs(this.collection.getSongs());
        },
        
        _onClickPlayAllButton: function () {
            this.streamItems.addSongs(this.collection.getSongs(), {
                playOnAdd: true
            });
        },
        
        _onSignInManagerChangeSignedInUser: function() {
            this._setSaveAllButtonState();
        },

        _onChangeSearching: function () {
            this._toggleInstructions();
        },

        _onChangeQuery: function () {
            this._toggleInstructions();
        },

        _onSearchResultsReset: function () {
            this._toggleInstructions();
            this._setButtonStates();
        },
        
        _onSearchResultsAdd: function () {
            this._toggleInstructions();
            this._setButtonStates();
        },
        
        _onSearchResultsRemove: function () {
            this._toggleInstructions();
            this._setButtonStates();
        },

        //  Searches youtube for song results based on the given text.
        _search: function (options) {
            this.model.set('query', options.query);
        },

        _setSaveAllButtonState: function () {
            var canSave = this._canSave();
            this.ui.saveAllButton.toggleClass('is-disabled', !canSave);
        },

        _setButtonStates: function () {
            this._setSaveAllButtonState();
            var isEmpty = this.collection.isEmpty();
            this.ui.playAllButton.toggleClass('is-disabled', isEmpty);
            this.ui.addAllButton.toggleClass('is-disabled', isEmpty);
        },

        _showSaveSelectedSimpleMenu: function () {
            var canSave = this._canSave();

            if (canSave) {
                var offset = this.ui.saveAllButton.offset();

                Streamus.channels.saveSongs.commands.trigger('show:simpleMenu', {
                    playlists: this.signInManager.get('signedInUser').get('playlists'),
                    songs: this.collection.getSongs(),
                    top: offset.top,
                    left: offset.left
                });
            }
        },
        
        _canSave: function () {
            var signedIn = this.signInManager.get('signedInUser') !== null;
            var isEmpty = this.collection.isEmpty();

            return signedIn && !isEmpty;
        },

        //  Set the visibility of any visible text messages.
        _toggleInstructions: function () {
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