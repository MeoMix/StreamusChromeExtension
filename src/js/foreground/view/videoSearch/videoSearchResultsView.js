define([
    'foreground/collection/videoSearchResults',
    'foreground/view/multiSelectView',
    'foreground/view/videoSearch/videoSearchResultView',
    'text!template/videoSearchResults.html',
    'common/model/utility',
    'foreground/collection/contextMenuGroups',
    'foreground/collection/streamItems'
], function (VideoSearchResults, MultiSelectView, VideoSearchResultView, VideoSearchResultsTemplate, Utility, ContextMenuGroups, StreamItems) {
    'use strict';

    var VideoSearchResultsView = MultiSelectView.extend({
        className: 'left-list',
        
        template: _.template(VideoSearchResultsTemplate),
        
        attributes: {
            id: 'searchResultsList'
        },
        
        model: VideoSearchResults,
        
        events: function(){
            return _.extend({}, MultiSelectView.prototype.events, {
                'contextmenu': 'showContextMenu'
                //  TODO: views don't throw a 'destroyed' event. This view probably memory leaks in its current implementation
                //  because whenever VideoSearchView hides itself (and calls removed on itself), this view's html is removed, but
                //  none of the event listeners are cleaned up. Suggest we implement something to fix that!
                //'destroyed': 'destroyedHandler'
            });
        },
        
        render: function () {
            this.addAll();

            this.$el.find('img.lazy').lazyload({
                effect: 'fadeIn',
                threshold: 500,
                container: this.el
            });
            
            this.initializeTooltips();

            MultiSelectView.prototype.render.call(this, arguments);

            return this;
        },
        
        initialize: function () {
            this.listenTo(this.model, 'reset', this.render);
            
            //  TODO: re-add once complete.
            //  Add key bindings
            //key('down, up', this.selectResultOnUpDown.bind(this));
        },
        
        //  When the user presses the 'up' key or the 'down' key while there are video search results,
        //  select the logically next or previous result.
        selectResultOnUpDown: function(event) {

            var previousElem = this.model.selected();
            if (previousElem.length) previousElem = previousElem[0];

            var nextElem;
            //  TODO: Why is the keyIdentifier capital down but the key listener is lowercase?
            if (event.keyIdentifier == "Down") {
                if (!previousElem) nextElem = this.model.at(0);
                else nextElem = this.model.at(this.model.indexOf(previousElem) + 1);
            }
            else {
                if (!previousElem) nextElem = this.model.at(0);
                else nextElem = this.model.at(this.model.indexOf(previousElem) - 1);
            }

            //  TODO: Unfinished code:
            var videoId = nextElem.get("video").get("id");
            var videoSearchResult = this.model.getByVideoId(videoId);

            this.doSetSelected({
                modelToSelect: nextElem
            });
        },

        destroyedHandler: function () {
            key.unbind("down, up");
        },
        
        addOne: function (videoSearchResult) {

            //  The first 11 search results should not be lazily loaded because they're immediately visible.
            //  So, keep track of the item's index on the view to be able to account for this during rendering.
            var index = this.model.indexOf(videoSearchResult);

            var videoSearchResultView = new VideoSearchResultView({
                model: videoSearchResult,
                //  TODO: This is hardcoded. Need to calculate whether a search result is visible or not.
                instant: index <= 8
            });
            
            this.$el.append(videoSearchResultView.render().el);
        },
        
        addAll: function () {

            var videoSearchResultElements = this.model.map(function (videoSearchResult, index) {

                var videoSearchResultView = new VideoSearchResultView({
                    model: videoSearchResult,
                    //  TODO: This is hardcoded. Need to calculate whether a search result is visible or not.
                    instant: index <= 8
                });

                return videoSearchResultView.render().el;

            });

            this.$el.append(videoSearchResultElements);
        },

        showContextMenu: function (event) {
            //  Whenever a context menu is shown -- set preventDefault to true to let foreground know to not reset the context menu.
            event.preventDefault();

            if (event.target === event.currentTarget || $(event.target).hasClass('big-text') || $(event.target).hasClass('i-4x')) {
                //  Didn't bubble up from a child -- clear groups.
                ContextMenuGroups.reset();
            }

            var selectedSearchResults = this.model.selected();

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
        },
       
    });

    return VideoSearchResultsView;
});