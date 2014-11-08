define([
    'foreground/view/prompt/saveSongsPromptView',
    'foreground/view/search/searchResultsView',
    'text!template/search/search.html'
], function (SaveSongsPromptView, SearchResultsView, SearchTemplate) {
    'use strict';

    var SearchView = Backbone.Marionette.LayoutView.extend({
        id: 'search',
        className: 'leftPane column column--wide u-flex--column u-flex--full panel panel--left panel--uncolored u-transitionable u-focusable',
        template: _.template(SearchTemplate),
        
        attributes: {
            //  Allow keyboard shortcuts to be handled by the view by giving it a tabindex so that keydown will run.
            tabindex: 0
        },

        ui: {
            searchInput: '#search-searchInput',
            hideSearchButton: '#search-hideSearchButton',
            playSelectedButton: '#search-playSelectedButton',
            saveSelectedButton: '#search-saveSelectedButton',
            addSelectedButton: '#search-addSelectedButton'
        },
        
        events: {
            'keydown': '_onKeyDown',
            'input @ui.searchInput': '_onInputSearchInput',
            'click @ui.hideSearchButton': '_onClickHideSearchButton',
            'click @ui.playSelectedButton:not(.disabled)': '_onClickPlaySelectedButton',
            'click @ui.addSelectedButton:not(.disabled)': '_onClickAddSelectedButton',
            'click @ui.saveSelectedButton:not(.disabled)': '_onClickSaveSelectedButton'
        },

        modelEvents: {
            'change:query': '_onChangeQuery'
        },

        collectionEvents: {
            'change:selected': '_onSearchResultsChangeSelected'
        },
 
        templateHelpers: {
            searchMessage: chrome.i18n.getMessage('search'),
            saveSelectedMessage: chrome.i18n.getMessage('saveSelected'),
            addSelectedMessage: chrome.i18n.getMessage('addSelected'),
            playSelectedMessage: chrome.i18n.getMessage('playSelected'),
            notSignedInMessage: chrome.i18n.getMessage('notSignedIn')
        },
        
        regions: {
            searchResultsRegion: '#search-searchResultsRegion'
        },
        
        transitionDuration: 300,
        streamItems: null,
        signInManager: null,
        visible: false,

        initialize: function () {
            this.streamItems = Streamus.backgroundPage.stream.get('items');
            this.signInManager = Streamus.backgroundPage.signInManager;

            this.listenTo(this.signInManager, 'change:signedInUser', this._onSignInManagerChangeSignedInUser);
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
        
        _onKeyDown: function (event) {
            //  If Ctrl + A is pressed in the search view when not working with the input -- select all results
            if (event.ctrlKey && event.which === 65 && !this.ui.searchInput.is(':focus')) {
                this.collection.selectAll();
            }
        },
        
        _onChangeQuery: function (model, query) {
            this.ui.searchInput.val(query);
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
        
        _onClickHideSearchButton: function () {
            this._hide();
        },
        
        _onInputSearchInput: function () {
            this._search();
        },
        
        _onSignInManagerChangeSignedInUser: function() {
            this._toggleSaveSelected();
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