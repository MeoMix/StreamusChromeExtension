define([
    'foreground/view/genericForegroundView',
    'foreground/view/multiSelectCompositeView',
    'foreground/model/foregroundViewManager',
    'text!template/videoSearch.html',
    'foreground/view/videoSearch/videoSearchResultView',
    'foreground/view/videoSearch/playSelectedButtonView',
    'foreground/view/videoSearch/saveSelectedButtonView',
    'foreground/model/settings',
    'foreground/collection/contextMenuGroups'
], function (GenericForegroundView, MultiSelectCompositeView, ForegroundViewManager, VideoSearchTemplate, VideoSearchResultView, PlaySelectedButtonView, SaveSelectedButtonView, Settings, ContextMenuGroups) {
    'use strict';
    
    var VideoSearchView = MultiSelectCompositeView.extend({
        
        className: 'left-pane',
        id: 'videoSearch',
        
        template: _.template(VideoSearchTemplate),
        itemViewContainer: '#videoSearchResults',
        
        itemView: VideoSearchResultView,

        itemViewOptions: function (model, index) {
            return {
                //  TODO: This is hardcoded. Need to calculate whether a search result is visible or not.
                instant: index <= 8
            };
        },

        ui: {
            bottomMenubar: '.left-bottom-menubar',
            playlistActions: '.playlist-actions',
            searchInput: '.searchBar input',
            searchingMessage: 'div.searching',
            instructions: 'div.instructions',
            //  TODO: This could be handled by a Marionette.CollectionView's empty html.
            noResultsMessage: 'div.noResults',
            bigTextWrapper: 'div.big-text-wrapper',
            videoSearchResults: '#videoSearchResults'
        },
        
        events: _.extend({}, MultiSelectCompositeView.prototype.events, {
            'input @ui.searchInput': 'showVideoSuggestions',
            'click button#hideVideoSearch': 'destroyModel',
            'contextmenu @ui.videoSearchResults': 'showContextMenu',
            //  TODO: views don't throw a 'destroyed' event. This view probably memory leaks in its current implementation
            //  because whenever VideoSearchView hides itself (and calls removed on itself), this view's html is removed, but
            //  none of the event listeners are cleaned up. Suggest we implement something to fix that!
            //'destroyed': 'destroyedHandler'
        }),
        
        templateHelpers: {
            //  Mix in chrome to reference internationalize.
            'chrome.i18n': chrome.i18n
        },
        
        modelEvents: {
            'destroy': 'hide',
            'change:searchJqXhr change:searchQuery': 'toggleBigText'
        },

        collectionEvents: {
            'reset': 'toggleBigText',
            'change:selected': 'toggleBottomMenubar'
        },

        onRender: function () {
            
            this.ui.playlistActions.append((new PlaySelectedButtonView()).render().el);
            this.ui.playlistActions.append((new SaveSelectedButtonView()).render().el);

            GenericForegroundView.prototype.initializeTooltips.call(this);

            this.toggleBigText();
            this.toggleBottomMenubar();
            
            var searchQuery = Settings.get('searchQuery');
            this.ui.searchInput.val(searchQuery);
            
            //  Refresh search results if necessary (search query and no results, or no search query at all -- clear)
            if (searchQuery === '' || this.collection.length === 0) {
                this.ui.searchInput.trigger('input');
            } else {
                //  Otherwise keep the model's state in sync because we just loaded searchQuery from settings.
                this.model.set('searchQuery', searchQuery, { silent: true });
            }
            
            this.$el.find('img.lazy').lazyload({
                effect: 'fadeIn',
                threshold: 500,
                container: this.el
            });

            //  TODO: Is there a better way to do this?
            MultiSelectCompositeView.prototype.onRender.call(this, arguments);
        },
        
        initialize: function () {

            $(window).unload(function() {
                this.saveSearchQuery();
                this.cleanup();
            }.bind(this));
            
            ForegroundViewManager.get('views').push(this);
            
            //  TODO: re-add once complete.
            //  Add key bindings
            //key('down, up', this.selectResultOnUpDown.bind(this));
        },
        
        showAndFocus: function (instant) {
            
            this.$el.transition({
                x: this.$el.width()
            }, instant ? 0 : undefined, 'snap');

            this.ui.searchInput.focus();

            chrome.extension.getBackgroundPage().stopClearResultsTimer();
        },
        
        destroyModel: function () {
            this.model.destroy();
        },
        
        hide: function() {
            this.$el.transition({
                x: -20
            }, this.cleanup.bind(this));
        },
        
        cleanup: function () {
            this.remove();
            this.startClearResultsTimeout();
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
            var searchQuery = $.trim(this.ui.searchInput.val());
            return searchQuery;
        },
        
        //  Searches youtube for video results based on the given text.
        showVideoSuggestions: function () {
            var searchQuery = this.getSearchQuery();
            this.model.set('searchQuery', searchQuery);
        },
        
        toggleBottomMenubar: function () {
            
            if (this.collection.selected().length === 0) {
                this.ui.bottomMenubar.hide();
                this.ui.bigTextWrapper.addClass('extended');
            } else {
                this.ui.bottomMenubar.show();
                this.ui.bigTextWrapper.removeClass('extended');
            }
            
        },

        //  Set the visibility of any visible text messages.
        toggleBigText: function () {

            //  Hide the search message when not searching.
            var isNotSearching = this.model.get('searchJqXhr') === null;
            this.ui.searchingMessage.toggleClass('hidden', isNotSearching);

            //  Hide the instructions message once user has searched or are searching.
            var hasSearchResults = this.collection.length > 0;
            var hasSearchQuery = this.model.get('searchQuery').length > 0;
            this.ui.instructions.toggleClass('hidden', hasSearchResults || hasSearchQuery);

            //  Only show no results when all other options are exhausted and user has interacted.
            var hasNoResults = isNotSearching && hasSearchQuery && !hasSearchResults;
            this.ui.noResultsMessage.toggleClass('hidden', !hasNoResults);

        },

        //  When the user presses the 'up' key or the 'down' key while there are video search results,
        //  select the logically next or previous result.
        selectResultOnUpDown: function (event) {

            var previousElem = this.collection.selected();
            if (previousElem.length) previousElem = previousElem[0];

            var nextElem;
            //  TODO: Why is the keyIdentifier capital down but the key listener is lowercase?
            if (event.keyIdentifier == "Down") {
                if (!previousElem) nextElem = this.collection.at(0);
                else nextElem = this.collection.at(this.collection.indexOf(previousElem) + 1);
            }
            else {
                if (!previousElem) nextElem = this.collection.at(0);
                else nextElem = this.collection.at(this.collection.indexOf(previousElem) - 1);
            }

            //  TODO: Unfinished code:
            var videoId = nextElem.get("video").get("id");
            var videoSearchResult = this.collection.getByVideoId(videoId);

            this.doSetSelected({
                modelToSelect: nextElem
            });
        },

        destroyedHandler: function () {
            key.unbind("down, up");
        },

        showContextMenu: function (event) {
            //  Whenever a context menu is shown -- set preventDefault to true to let foreground know to not reset the context menu.
            event.preventDefault();

            if (event.target === event.currentTarget || $(event.target).hasClass('big-text') || $(event.target).hasClass('i-4x')) {
                //  Didn't bubble up from a child -- clear groups.
                ContextMenuGroups.reset();
            }

            var selectedSearchResults = this.collection.selected();

            var noSearchResultsSelected = selectedSearchResults.length === 0;

            ContextMenuGroups.add({
                items: [{
                    text: chrome.i18n.getMessage('playSelected') + ' (' + selectedSearchResults.length + ')',
                    disabled: noSearchResultsSelected,
                    onClick: function () {

                        if (!noSearchResultsSelected) {

                            var videos = _.map(selectedSearchResults, function (videoSearchResult) {
                                return videoSearchResult.get('video');
                            });

                            StreamItems.addByVideos(videos, true);

                        }

                    }
                }, {
                    text: chrome.i18n.getMessage('enqueueSelected') + ' (' + selectedSearchResults.length + ')',
                    disabled: noSearchResultsSelected,
                    onClick: function () {

                        if (!noSearchResultsSelected) {

                            var videos = _.map(selectedSearchResults, function (videoSearchResult) {
                                return videoSearchResult.get('video');
                            });

                            StreamItems.addByVideos(videos, false);

                        }

                    }
                }]
            });
        }

    });

    return VideoSearchView;
});