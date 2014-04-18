define([
    'foreground/view/multiSelectCompositeView',
    'foreground/view/leftBasePane/playlistItemView',
    'text!template/activePlaylistArea.html'
], function (MultiSelectCompositeView, PlaylistItemView, ActivePlaylistAreaTemplate) {
    'use strict';

    var StreamItems = chrome.extension.getBackgroundPage().StreamItems;

    var ActivePlaylistAreaView = MultiSelectCompositeView.extend({

        template: _.template(ActivePlaylistAreaTemplate),
        
        templateHelpers: function () {
            return {
                showSearchMessage: chrome.i18n.getMessage('showSearch'),
                searchForSongsMessage: chrome.i18n.getMessage('searchForSongs'),
                playlistEmptyMessage: chrome.i18n.getMessage('playlistEmpty'),
                wouldYouLikeToMessage: chrome.i18n.getMessage('wouldYouLikeTo'),
                addAllMessage: chrome.i18n.getMessage('addAll'),
                playAllMessage: chrome.i18n.getMessage('playAll')
            };
        },

        itemView: PlaylistItemView,
        itemViewContainer: '#active-playlist-items',

        ui: {
            list: '.list',
            playlistDetails: '.playlist-details',
            playlistEmptyMessage: '.playlist-empty',
            bottomMenubar: '.left-bottom-menubar',
            itemContainer: '#active-playlist-items',
            bigTextWrapper: '.big-text-wrapper',
            playAll: '.play-all',
            addAll: '.add-all'
        },
        
        events: _.extend({}, MultiSelectCompositeView.prototype.events, {
            'click @ui.addAll': 'addAllToStream',
            'click @ui.playAll': 'playAllInStream'
        }),
        
        modelEvents: {
            'change:displayInfo': 'updatePlaylistDetails'
        },
        
        collectionEvents: {
            'add remove reset': function () {
                this.toggleBigText();
                this.toggleBottomMenubar();
            }
        },

        onShow: function () {
            this.onFullyVisible();
            
            this.ui.playlistDetails.qtip();
            this.ui.addAll.qtip();
            this.ui.playAll.qtip();
            
            this.children.each(function (child) {
                child.setTitleTooltip(child.ui.title);
            });

            var self = this;
            var lastScrollTop = 0;
            
            //  Throttle the scroll event because scrolls can happen a lot and don't need to re-calculate very often.
            this.ui.list.scroll(_.throttle(function () {
                var scrollTop = this.scrollTop;
                console.log("scrollTop:", scrollTop);
                var currentMaxRenderedIndex = self.maxRenderedIndex;
                var currentMinRenderedIndex = self.minRenderedIndex;

                var direction = scrollTop > lastScrollTop ? 'down' : 'up';
                
                //  Only append again after scrolling a full page's worth. This will keep the buffer the same size for each append. 
                var scrollAllowance = self.getScrollAllowance();
                console.log("scrollAllowance:", scrollAllowance);
                
                //  When the user scrolls down, append new items to the end of the list and remove from the start.
                if (direction === 'down') {
                    
                    //  Whenever a scroll amount is exceeded -- need to append next page and potentially clean-up previous page.
                    if (scrollTop >= scrollAllowance) {

                        //  Grab the next page of information.
                        var nextBatch = self.collection.slice(currentMaxRenderedIndex, currentMaxRenderedIndex + self.pageSize);

                        if (nextBatch.length > 0) {
                            self.maxRenderedIndex += nextBatch.length;
      
                            //  Leverage Marionette's style of rendering for performance.
                            self.initRenderBuffer();
                            self.startBuffering();

                            var ItemView;
                            _.each(nextBatch, function (item, index) {
                                ItemView = this.getItemView(item);

                                //  Adjust the items index to account for where it is actually being added in the list
                                this.addItemView(item, ItemView, index + currentMaxRenderedIndex);
                            }, self);

                            self.endBuffering();
                        }
                        
                        //  Cleanup N items where N is the amounts of items being added to the front.
                        var previousBatch = self.children.toArray().slice(0, nextBatch.length);

                        if (previousBatch.length > 0) {
                            self.minRenderedIndex += previousBatch.length;

                            _.each(previousBatch, function(child) {
                                this.removeChildView(child);
                            }, self);
                        }

                        //  Adjust padding and height to properly position relative items inside of list since not all items are rendered.
                        self.ui.itemContainer.css('padding-top', self.minRenderedIndex * self.itemViewHeight);
                        self._setHeight();
                    }
                } else {
                    //  TODO: Support scrolling up as well as down.
                    
                    if (scrollTop <= scrollAllowance) {
                        //  Grab the next page of information.
                        var nextBatch = self.collection.slice(currentMinRenderedIndex - self.pageSize, currentMinRenderedIndex);

                        if (nextBatch.length > 0) {
                            self.minRenderedIndex -= nextBatch.length;

                            //  Leverage Marionette's style of rendering for performance.
                            self.initRenderBuffer();
                            self.startBuffering();

                            var ItemView;
                            _.each(nextBatch, function (item, index) {
                                ItemView = this.getItemView(item);

                                console.log("tacking on a previous item at index", index + currentMinRenderedIndex);

                                //  Adjust the items index to account for where it is actually being added in the list
                                this.addItemView(item, ItemView, index + currentMinRenderedIndex);
                            }, self);

                            self.endBuffering();
                        }

                        //  Cleanup N items where N is the amounts of items being added to the front.
                        //var previousBatch = self.children.toArray().slice(0, nextBatch.length);

                        //if (previousBatch.length > 0) {
                        //    self.minRenderedIndex += previousBatch.length;

                        //    _.each(previousBatch, function (child) {
                        //        this.removeChildView(child);
                        //    }, self);
                        //}

                        //  Adjust padding and height to properly position relative items inside of list since not all items are rendered.
                        self.ui.itemContainer.css('padding-top', self.minRenderedIndex * self.itemViewHeight);
                        self._setHeight();
                    }
                }

                lastScrollTop = scrollTop;
            }, 50));
        },

        onRender: function () {            
            this.toggleBigText();
            this.toggleBottomMenubar();
            this._setHeight();

            MultiSelectCompositeView.prototype.onRender.call(this, arguments);
        },
        
        updatePlaylistDetails: function () {
            var displayInfo = this.model.get('displayInfo');

            this.ui.playlistDetails.text(displayInfo);
            
            //  Be sure to call render first or else setting content.text won't actually update it.
            this.ui.playlistDetails.qtip('render');
            this.ui.playlistDetails.qtip('option', 'content.text', displayInfo);
        },
       
        //  Set the visibility of any visible text messages.
        toggleBigText: function () {
            this.ui.playlistEmptyMessage.toggleClass('hidden', this.collection.length > 0);
        },
        
        toggleBottomMenubar: function () {
            this.ui.bottomMenubar.toggle(this.collection.length > 0);
            this.ui.bigTextWrapper.toggleClass('extended', this.collection.length === 0);
        },

        addAllToStream: function () {
            StreamItems.addSongs(this.model.get('items').pluck('song'));
        },
        
        playAllInStream: function() {
            StreamItems.addSongs(this.model.get('items').pluck('song'), {
                playOnAdd: true
            });
        },
        
        //  Set the elements height calculated from the number of potential items rendered into it.
        //  Necessary because items are lazy-appended for performance, but scrollbar size changing not desired.
        _setHeight: function () {
            //  TODO: 40 is hardcoded
            this.ui.itemContainer.height(this.collection.length * 40 - (this.minRenderedIndex * this.itemViewHeight));
        }
    });

    return ActivePlaylistAreaView;
});