define([
    'common/enum/listItemType',
    'foreground/view/behavior/multiSelect',
    'foreground/view/behavior/slidingRender',
    'foreground/view/behavior/sortable',
    'foreground/view/behavior/tooltip',
    'foreground/view/leftCoveringPane/searchResultView',
    'foreground/view/prompt/saveSongsPromptView',
    'text!template/search.html'
], function (ListItemType, MultiSelect, SlidingRender, Sortable, Tooltip, SearchResultView, SaveSongsPromptView, SearchTemplate) {
    'use strict';

    var StreamItems = Streamus.backgroundPage.StreamItems;
    var SignInManager = Streamus.backgroundPage.SignInManager;
    
    var SearchView = Backbone.Marionette.CompositeView.extend({
        className: 'search left-pane full flex-column panel',
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
            bottomBar: '.contentBar-bottom',
            searchInput: '.search-input',
            searchingMessage: '.searching',
            typeToSearchMessage: '.type-to-search',
            noResultsMessage: '.no-results',
            childContainer: '#search-results',
            saveSelectedButton: '#save-selected',
            hideSearchButton: '.hide-search',
            playSelectedButton: '#play-selected',
            addSelectedButton: '#add-selected'
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
            'change:selected': '_toggleBottomBar'
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
                MultiSelect: {
                    behaviorClass: MultiSelect
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
        
        initialize: function () {
            this.listenTo(SignInManager, 'change:signedIn', this._toggleSaveSelected);
        },
 
        onRender: function () {
            this._toggleInstructions();
            this._toggleBottomBar();
            this._toggleSaveSelected();
        },
        
        onShow: function () {
            this.model.stopClearQueryTimer();
            
            //  Reset val after focusing to prevent selecting the text while maintaining focus.
            this.ui.searchInput.focus().val(this.ui.searchInput.val());

            //  By passing undefined in I opt to use the default duration length.
            var transitionDuration = this.options.doSnapAnimation ? undefined : 0;

            this.$el.transition({
                x: this.$el.width()
            }, transitionDuration, 'snap');
        },

        onDestroy: function () {
            //  Remember search query for a bit just in case user close/re-open quickly, no need to re-search.
            this.model.startClearQueryTimer();
        },
        
        //  Shake the view to bring attention to the fact that the view is already visible.
        //  Throttled so that the animations can't stack up if shake is spammed.
        shake: _.throttle(function() {
            this.$el.effect('shake', {
                distance: 3,
                times: 3
            });
        }, 500),
        
        _hide: function () {
            //  Transition the view back out before closing.
            this.$el.transition({
                //  Transition -20px off the screen to account for the shadow on the view.
                x: -20
            }, this.destroy.bind(this));
        },
        
        //  Searches youtube for song results based on the given text.
        _search: function () {
            var query = this.ui.searchInput.val();
            this.model.set('query', query);
        },
        
        _toggleSaveSelected: function () {
            var signedIn = SignInManager.get('signedIn');
            this.ui.saveSelectedButton.toggleClass('disabled', !signedIn);

            var templateHelpers = this.templateHelpers();
            this.ui.saveSelectedButton.attr('title', signedIn ? templateHelpers.saveSelectedMessage : templateHelpers.cantSaveNotSignedInMessage);
        },
        
        _toggleBottomBar: function () {
            var selectedCount = this.collection.selected().length;
            this.ui.bottomBar.toggleClass('hidden', selectedCount === 0);

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
            StreamItems.addSongs(this.collection.getSelectedSongs(), {
                playOnAdd: true
            });
        },
        
        _addSelected: function() {
            StreamItems.addSongs(this.collection.getSelectedSongs());
        },

        _showSaveSelectedPrompt: function () {
            var disabled = this.ui.saveSelectedButton.hasClass('disabled');
            
            if (!disabled) {
                Backbone.Wreqr.radio.channel('prompt').vent.trigger('show', SaveSongsPromptView, {
                    songs: this.collection.getSelectedSongs()
                });
            }
            //  Don't close the menu if disabled
            return !disabled;
        }
    });

    return SearchView;
});