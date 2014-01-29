define([
    'foreground/view/genericForegroundView',
    'foreground/view/videoSearch/videoSearchResultsView',
    'text!template/videoSearch.html',
    'foreground/view/videoSearch/playSelectedButtonView',
    'foreground/view/videoSearch/saveSelectedButtonView',
    'foreground/collection/videoSearchResults',
    'foreground/model/settings'
], function (GenericForegroundView, VideoSearchResultsView, VideoSearchTemplate, PlaySelectedButtonView, SaveSelectedButtonView, VideoSearchResults, Settings) {
    'use strict';

    var VideoSearchView = GenericForegroundView.extend({
        
        className: 'left-pane',
        
        template: _.template(VideoSearchTemplate),
        
        videoSearchResultsView: null,
        
        attributes: {
            id: 'videoSearch'
        },
        
        searchInput: null,
        playSelectedButtonView: null,
        saveSelectedButtonView: null,
        
        searchingMessage: null,
        instructions: null,
        noResultsMessage: null,
        bigTextWrapper: null,
        
        searchInputFocused: false,
        
        bottomMenubar: null,
        
        events: {
            'input .searchBar input': 'showVideoSuggestions',
            'click button#hideVideoSearch': 'destroyModel'
        },

        render: function () {
            this.$el.html(this.template(
                _.extend(this.model.toJSON(), {
                    //  Mix in chrome to reference internationalize.
                    'chrome.i18n': chrome.i18n
                })
            ));

            this.$el.find('#videoSearchResultsView').replaceWith(this.videoSearchResultsView.render().el);

            this.bottomMenubar = this.$el.find('.left-bottom-menubar');

            var playlistActions = this.$el.find('.playlist-actions');

            playlistActions.append(this.playSelectedButtonView.render().el);
            playlistActions.append(this.saveSelectedButtonView.render().el);

            this.searchInput = this.$el.find('.searchBar input');
            this.initializeTooltips();
            
            this.searchingMessage = this.$el.find('div.searching');
            this.instructions = this.$el.find('div.instructions');
            this.noResultsMessage = this.$el.find('div.noResults');
            this.bigTextWrapper = this.$el.find('div.big-text-wrapper');

            this.toggleBigText();
            this.toggleBottomMenubar();
            
            var searchQuery = Settings.get('searchQuery');
            this.searchInput.val(searchQuery);
            
            //  Refresh search results if necessary (search query and no results, or no search query at all -- clear)
            if (searchQuery === '' || VideoSearchResults.length === 0) {
                this.searchInput.trigger('input');
            } else {
                //  Otherwise keep the model's state in sync because we just loaded searchQuery from settings.
                this.model.set('searchQuery', searchQuery, { silent: true });
            }
            
            return this;
        },
        
        initialize: function () {

            this.playSelectedButtonView = new PlaySelectedButtonView();
            this.saveSelectedButtonView = new SaveSelectedButtonView();
            this.videoSearchResultsView = new VideoSearchResultsView();
            
            this.listenTo(this.model, 'destroy', this.hide);
            this.listenTo(this.model, 'change:searchJqXhr change:searchQuery', this.toggleBigText);
            this.listenTo(VideoSearchResults, 'reset', this.toggleBigText);
            this.listenTo(VideoSearchResults, 'change:selected', this.toggleBottomMenubar);

            $(window).unload(function() {
                this.saveSearchQuery();
                this.startClearResultsTimeout();
            }.bind(this));
        },
        
        showAndFocus: function (instant) {
            
            this.$el.transition({
                x: this.$el.width()
            }, instant ? 0 : undefined, 'snap');

            this.searchInput.focus();

            chrome.extension.getBackgroundPage().stopClearResultsTimer();
        },
        
        destroyModel: function () {
            this.model.destroy();
        },
        
        hide: function() {
            this.$el.transition({
                x: -20
            }, function () {
                this.remove();
                this.startClearResultsTimeout();
            }.bind(this));
        },
        
        //  Wait a while before forgetting search results because sometimes people just leave for a second and its frustrating to lose the results.
        //  But, if you've been gone away a while you don't want to have to clear your old stuff.
        startClearResultsTimeout: function () {
            //  It's important to write this to the background page because the foreground gets destroyed so it couldn't possibly remember it.
            chrome.extension.getBackgroundPage().startClearResultsTimer();
        },
        
        saveSearchQuery: function () {
            Settings.set('searchQuery', this.model.get('searchQuery'));
        },
        
        getSearchQuery: function () {
            var searchQuery = $.trim(this.searchInput.val());
            return searchQuery;
        },
        
        //  Searches youtube for video results based on the given text.
        showVideoSuggestions: function () {
            var searchQuery = this.getSearchQuery();
            this.model.set('searchQuery', searchQuery);
        },
        
        toggleBottomMenubar: function () {
            
            if (VideoSearchResults.selected().length === 0) {
                this.bottomMenubar.hide();
                this.bigTextWrapper.addClass('extended');
            } else {
                this.bottomMenubar.show();
                this.bigTextWrapper.removeClass('extended');
            }
            
        },

        //  Set the visibility of any visible text messages.
        toggleBigText: function () {

            //  Hide the search message when not searching.
            var isNotSearching = this.model.get('searchJqXhr') === null;
            this.searchingMessage.toggleClass('hidden', isNotSearching);

            //  Hide the instructions message once user has searched or are searching.
            var hasSearchResults = VideoSearchResults.length > 0;
            var hasSearchQuery = this.model.get('searchQuery').length > 0;
            this.instructions.toggleClass('hidden', hasSearchResults || hasSearchQuery);

            //  Only show no results when all other options are exhausted and user has interacted.
            var hasNoResults = isNotSearching && hasSearchQuery && !hasSearchResults;
            this.noResultsMessage.toggleClass('hidden', !hasNoResults);

        }

    });

    return VideoSearchView;
});