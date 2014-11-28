define([
    'foreground/view/prompt/saveSongsPromptView',
    'foreground/view/search/searchResultsView',
    'text!template/search/search.html'
], function (SaveSongsPromptView, SearchResultsView, SearchTemplate) {
    'use strict';

    var SearchView = Marionette.LayoutView.extend({
        id: 'search',
        className: 'leftPane column u-flex--column u-flex--full',
        template: _.template(SearchTemplate),
        
        templateHelpers: {
            searchMessage: chrome.i18n.getMessage('search'),
            saveSelectedMessage: chrome.i18n.getMessage('saveSelected'),
            addSelectedMessage: chrome.i18n.getMessage('addSelected'),
            playSelectedMessage: chrome.i18n.getMessage('playSelected'),
            notSignedInMessage: chrome.i18n.getMessage('notSignedIn')
        },

        regions: function () {
            return {
                searchResultsRegion: '#' + this.id + '-searchResultsRegion'
            };
        },
        
        ui: function () {
            return {
                playSelectedButton: '#' + this.id + '-playSelectedButton',
                saveSelectedButton: '#' + this.id + '-saveSelectedButton',
                addSelectedButton: '#' + this.id + '-addSelectedButton'
            };
        },
        
        events: {
            'click @ui.playSelectedButton:not(.disabled)': '_onClickPlaySelectedButton',
            'click @ui.addSelectedButton:not(.disabled)': '_onClickAddSelectedButton',
            'click @ui.saveSelectedButton:not(.disabled)': '_onClickSaveSelectedButton'
        },

        modelEvents: {
            //'change:query': '_onChangeQuery'
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
        },
 
        onRender: function () {
            this._toggleSelectedButtons();
        },
        
        onShow: function () {
            this.searchResultsRegion.show(new SearchResultsView({
                //  TODO: SearchResultsView shouldn't have to be dependent on model
                model: this.model,
                collection: this.model.get('results')
            }));
        },
        
        //  onVisible is triggered when the element begins to transition into the viewport.
        onVisible: function () {
            this.model.stopClearQueryTimer();
        },
        
        //_onChangeQuery: function (model, query) {
        //    this.ui.searchInput.val(query);
        //},
        
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
        }
    });

    return SearchView;
});