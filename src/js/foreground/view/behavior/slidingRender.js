define(function(require) {
    'use strict';

    var Direction = require('common/enum/direction');

    var SlidingRender = Marionette.Behavior.extend({
        collectionEvents: {
            //  IMPORTANT: These method names are valid in Behavior but NOT in CompositeView or CollectionView; clashes with _onCollectionAdd and _onCollectionRemove in Marionette.
            'reset': '_onCollectionReset',
            'remove': '_onCollectionRemove',
            'add': '_onCollectionAdd',
            'add:completed': '_onCollectionAddCompleted',
            'change:active': '_onCollectionChangeActive'
        },
        
        //  Enables progressive rendering of children by keeping track of indices which are currently rendered.
        minRenderIndex: -1,
        maxRenderIndex: -1,

        //  The height of a rendered childView in px. Including padding/margin.
        childViewHeight: 56,
        childContainerHeight: -1,
        childContainerTranslateY: -1,
        viewportHeight: -1,
        
        //  The number of items to render outside of the viewport. Helps with flickering because if
        //  only views which would be visible are rendered then they'd be visible while loading.
        threshold: 10,

        //  Keep track of where user is scrolling from to determine direction and amount changed.
        lastScrollTop: 0,

        initialize: function() {
            //  Give the view an implementation of filter to enforce that not all children are rendered.
            this.view.filter = this._filter.bind(this);
            this.listenTo(Streamus.channels.window.vent, 'resize', this._onWindowResize);
            //  It's important to set minRenderIndex before onAttach because if a view triggers ListHeightUpdated during its
            //  onAttach then SlidingRender will call _setViewportHeight before minRenderIndex has been set.
            this.minRenderIndex = this._getMinRenderIndex(0);
        },

        onAttach: function() {
            //  Allow N items to be rendered initially where N is how many items need to cover the viewport.
            this._setViewportHeight();
            this._tryScrollToActiveItem();
            //  Throttle the scroll event because scrolls can happen a lot and don't need to re-calculate very often.
            this.el.addEventListener('scroll', _.throttleFramerate(this._onScroll.bind(this)));
            this.view.triggerMethod('UpdateScrollbar');
        },
        
        //  jQuery UI's sortable needs to be able to know the minimum rendered index. Whenever an external
        //  event requests the min render index -- return it!
        onGetMinRenderIndex: function() {
            this.view.triggerMethod('GetMinRenderIndexResponse', {
                minRenderIndex: this.minRenderIndex
            });
        },

        onListHeightUpdated: function() {
            this._setViewportHeight();
        },

        _onWindowResize: function() {
            this._setViewportHeight();
        },

        _onScroll: function() {
            this._setRenderedElements(this.el.scrollTop);
        },
        
        //  Whenever the viewport height is changed -- adjust the items which are currently rendered to match
        _setViewportHeight: function() {
            this.viewportHeight = this.$el.height();

            //  Unload or load N items where N is the difference in viewport height.
            var currentMaxRenderIndex = this.maxRenderIndex;

            var newMaxRenderIndex = this._getMaxRenderIndex(this.lastScrollTop);
            var indexDifference = currentMaxRenderIndex - newMaxRenderIndex;

            //  Be sure to update before potentially adding items or else they won't render.
            this.maxRenderIndex = newMaxRenderIndex;
            if (indexDifference > 0) {
                //  Unload N Items.
                //  Only remove items if need be -- collection's length might be so small that the viewport's height isn't affecting rendered count.
                if (this.view.collection.length > currentMaxRenderIndex) {
                    this._removeItemsByIndex(currentMaxRenderIndex, indexDifference);
                }
            } else if (indexDifference < 0) {
                //  Load N items
                for (var count = 0; count < Math.abs(indexDifference); count++) {
                    this._tryRenderElementAtIndex(currentMaxRenderIndex + 1 + count);
                }
            }

            this._setHeightTranslateY();
        },

        _tryScrollToActiveItem: function() {
            var isScrolling = false;

            var collection = this.view.collection;
            //  If the collection implements getActiveItem - scroll to the active item.
            if (collection.getActiveItem && collection.length > 0) {
                this._scrollToItem(collection.getActiveItem());
                isScrolling = true;
            }

            return isScrolling;
        },

        //  When deleting an element from a list it's important to render the next element (if any) since
        //  positions change when removing.
        _tryRenderElementAtIndex: function(index) {
            var rendered = false;

            if (this._indexWithinRenderRange(index)) {
                if (this.view.collection.length > index) {
                    var item = this.view.collection.at(index);
                    var ChildView = this.view.getChildView(item);
                    this.view.addChild(item, ChildView, index);
                    rendered = true;
                }
            }

            return rendered;
        },

        _setRenderedElements: function(scrollTop) {
            //  TODO: Clean this up. It's still such a huge function.
            /* jshint ignore:start */
            //  Figure out the range of items currently rendered:
            var currentMinRenderIndex = this.minRenderIndex;
            var currentMaxRenderIndex = this.maxRenderIndex;

            //  Figure out the range of items which need to be rendered:
            var minRenderIndex = this._getMinRenderIndex(scrollTop);
            var maxRenderIndex = this._getMaxRenderIndex(scrollTop);

            var itemsToAdd = [];
            var itemsToRemove = [];

            //  Append items in the direction being scrolled and remove items being scrolled away from.
            var direction = scrollTop > this.lastScrollTop ? Direction.Down : Direction.Up;

            if (direction === Direction.Down) {
                //  Need to remove items which are less than the new minRenderIndex
                if (minRenderIndex > currentMinRenderIndex) {
                    itemsToRemove = this.view.collection.slice(currentMinRenderIndex, minRenderIndex);
                }

                //  Need to add items which are greater than oldMaxRenderIndex and ltoe maxRenderIndex
                if (maxRenderIndex > currentMaxRenderIndex) {
                    itemsToAdd = this.view.collection.slice(currentMaxRenderIndex + 1, maxRenderIndex + 1);
                }
            } else {
                //  Need to add items which are greater than currentMinRenderIndex and ltoe minRenderIndex
                if (minRenderIndex < currentMinRenderIndex) {
                    itemsToAdd = this.view.collection.slice(minRenderIndex, currentMinRenderIndex);
                }

                //  Need to remove items which are greater than the new maxRenderIndex
                if (maxRenderIndex < currentMaxRenderIndex) {
                    itemsToRemove = this.view.collection.slice(maxRenderIndex + 1, currentMaxRenderIndex + 1);
                }
            }

            if (itemsToAdd.length > 0 || itemsToRemove.length > 0) {
                //  When drag-and-dropping an item to the end of a SlidingRender-enabled CollectionView, the 
                //  drag-and-drop behavior will push the scrollTop to a length which is greater than the collection's length.
                //  This causes rendering issues - so, safeguard against this happening and simply do not attempt to re-render in this scenario.
                if (maxRenderIndex < this.view.collection.length + this.threshold) {
                    this.minRenderIndex = minRenderIndex;
                    this.maxRenderIndex = maxRenderIndex;

                    if (itemsToAdd.length > 0) {
                        var currentTotalRendered = (currentMaxRenderIndex - currentMinRenderIndex) + 1;
                        if (direction === Direction.Down) {
                            //  Items will be appended after oldMaxRenderIndex. 
                            this._addItems(itemsToAdd, currentMaxRenderIndex + 1, currentTotalRendered, true);
                        } else {
                            this._addItems(itemsToAdd, minRenderIndex, currentTotalRendered, false);
                        }
                    }

                    if (itemsToRemove.length > 0) {
                        this._removeItems(itemsToRemove);
                    }

                    this._setHeightTranslateY();
                }
            }

            this.lastScrollTop = scrollTop;
            /* jshint ignore:end */
        },

        _setHeightTranslateY: function() {
            this._setTranslateY();
            this._setHeight();
        },

        //  Adjust translateY to properly position relative items inside of list since not all items are rendered.
        _setTranslateY: function() {
            var translateY = this._getTranslateY();

            if (translateY !== this.childContainerTranslateY) {
                this.childContainerTranslateY = translateY;
                this.ui.childContainer.css('transform', 'translateY(' + translateY + 'px)');
            }
        },

        _getTranslateY: function() {
            return this.minRenderIndex * this.childViewHeight;
        },

        //  Set the elements height calculated from the number of potential items rendered into it.
        //  Necessary because items are lazy-appended for performance, but scrollbar size changing not desired.
        _setHeight: function() {
            //  Subtracting minRenderIndex is important because of how CSS renders the element. If you don't subtract minRenderIndex
            //  then the rendered items will push up the height of the element by minRenderIndex * childViewHeight.
            var height = (this.view.collection.length - this.minRenderIndex) * this.childViewHeight;

            //  Keep height set to at least the viewport height to allow for proper drag-and-drop target - can't drop if height is too small.
            if (height < this.viewportHeight) {
                height = this.viewportHeight;
            }

            if (height !== this.childContainerHeight) {
                this.childContainerHeight = height;
                this.ui.childContainer.height(height);
            }
        },

        _addItems: function(models, indexOffset, currentTotalRendered, isAddingToEnd) {
            var skippedCount = 0;

            _.each(models, function(model, index) {
                var shouldAdd = this._indexWithinRenderRange(index + indexOffset);

                if (shouldAdd) {
                    var adjustedIndex = index;

                    //  Adjust the childView's index to account for where it is actually being added in the list
                    if (isAddingToEnd) {
                        adjustedIndex += (currentTotalRendered - skippedCount);
                    }

                    var ChildView = this.view.getChildView(model);
                    this.view.addChild(model, ChildView, adjustedIndex);
                } else {
                    skippedCount++;
                }
            }, this);
        },
        
        //  Remove N items from the end of the render item list.
        _removeItemsByIndex: function(startIndex, countToRemove) {
            for (var index = 0; index < countToRemove; index++) {
                var item = this.view.collection.at(startIndex - index);
                var childView = this.view.children.findByModel(item);
                this.view.removeChildView(childView);
            }
        },

        _removeItems: function(models) {
            _.each(models, function(model) {
                var childView = this.view.children.findByModel(model);
                this.view.removeChildView(childView);
            }, this);
        },

        _filter: function(child, index) {
            return this._indexWithinRenderRange(index);
        },

        _getMinRenderIndex: function(scrollTop) {
            var minRenderIndex = Math.floor(scrollTop / this.childViewHeight) - this.threshold;

            if (minRenderIndex < 0) {
                minRenderIndex = 0;
            }

            return minRenderIndex;
        },

        _getMaxRenderIndex: function(scrollTop) {
            //  Subtract 1 to make math 'inclusive' instead of 'exclusive'
            var maxRenderIndex = Math.ceil((scrollTop / this.childViewHeight) + (this.viewportHeight / this.childViewHeight)) - 1 + this.threshold;

            return maxRenderIndex;
        },

        //  Returns true if an childView at the given index would not be fully visible -- part of it rendering out of the top of the viewport.
        _indexOverflowsTop: function(index) {
            var position = index * this.childViewHeight;
            var scrollPosition = this.el.scrollTop;
            var overflowsTop = position < scrollPosition;

            return overflowsTop;
        },

        _indexOverflowsBottom: function(index) {
            //  Add one to index because want to get the bottom of the element and not the top.
            var position = (index + 1) * this.childViewHeight;
            var scrollPosition = this.el.scrollTop + this.viewportHeight;
            var overflowsBottom = position > scrollPosition;

            return overflowsBottom;
        },

        _indexWithinRenderRange: function(index) {
            var isInRange = index >= this.minRenderIndex && index <= this.maxRenderIndex;
            return isInRange;
        },
        
        //  TODO: An animation on this would be nice.
        //  Ensure that the active item is visible by setting the container's scrollTop to a position which allows it to be seen.
        _scrollToItem: function(item) {
            var itemIndex = this.view.collection.indexOf(item);

            var overflowsTop = this._indexOverflowsTop(itemIndex);
            var overflowsBottom = this._indexOverflowsBottom(itemIndex);

            //  Only scroll to the item if it isn't in the viewport.
            if (overflowsTop || overflowsBottom) {
                var scrollTop = 0;

                //  If the item needs to be made visible from the bottom, offset the viewport's height:
                if (overflowsBottom) {
                    //  Add 1 to index because want the bottom of the element and not the top.
                    scrollTop = (itemIndex + 1) * this.childViewHeight - this.viewportHeight;
                } else if (overflowsTop) {
                    scrollTop = itemIndex * this.childViewHeight;
                }

                this.el.scrollTop = scrollTop;
            }
        },

        //  Reset min/max, scrollTop, translateY and height to their default values.
        _onCollectionReset: function() {
            this.el.scrollTop = 0;
            this.lastScrollTop = 0;

            this.minRenderIndex = this._getMinRenderIndex(0);
            this.maxRenderIndex = this._getMaxRenderIndex(0);

            this._setHeightTranslateY();

            //  Give the items a second to disappear after being reset and then update.
            requestAnimationFrame(function() {
                this.view.triggerMethod('UpdateScrollbar');
            }.bind(this));
        },

        _onCollectionRemove: function(item, collection, options) {
            //  TODO: It would be nice to find a way to not have to leverage _.defer here.
            //  Use _.defer to wait for the view to remove the element corresponding to item.
            //  _renderElementAtIndex has an off-by-one error if executed immediately.
            _.defer(function() {
                //  Any function which is deferred can potentially be ran after the view is destroyed.
                if (!this.view.isDestroyed) {
                    //  When a rendered view is lost - render the next one since there's a spot in the viewport
                    //  Note that I'm checking to see if options.index is rendered rather than giving it to _renderElementAtIndex.
                    if (this._indexWithinRenderRange(options.index)) {
                        var rendered = this._tryRenderElementAtIndex(this.maxRenderIndex);

                        //  If failed to render next item and there are previous items waiting to be rendered, slide view back 1 item
                        if (!rendered && this.minRenderIndex > 0) {
                            //  Also ensure that the last item in the view is fully visible before doing the math for scrolling up.
                            var childContainerTotalHeight = this.childContainerHeight + this.childContainerTranslateY;
                            //  Determine what fraction of childViewHeight is still outside of the viewport.
                            var offsetToBottom = childContainerTotalHeight - this.lastScrollTop - this.viewportHeight;
                            //  Scroll up one item at max. Reduce the scroll amount by amount needed to force the last item into full view.
                            var scrollTop = this.lastScrollTop - this.childViewHeight + offsetToBottom;
                            this.el.scrollTop = scrollTop;
                        }
                    }

                    this._setHeightTranslateY();
                    this.view.triggerMethod('UpdateScrollbar');
                }
            }.bind(this));
        },

        _onCollectionAdd: function(item, collection) {
            var index = collection.indexOf(item);
            var indexWithinRenderRange = this._indexWithinRenderRange(index);

            //  Subtract 1 from collection.length because, for instance, if our collection has 8 items in it
            //  and min-max is 0-7, the 8th item in the collection has an index of 7.
            //  Use a > comparator not >= because we only want to run this logic when the viewport is overfilled and not just enough to be filled.
            var viewportOverfull = collection.length - 1 > this.maxRenderIndex;

            //  If a view has been rendered and it pushes another view outside of maxRenderIndex, remove that view.
            if (indexWithinRenderRange && viewportOverfull) {
                //  Adding one because I want to grab the item which is outside maxRenderIndex. maxRenderIndex is inclusive.
                this._removeItemsByIndex(this.maxRenderIndex + 1, 1);
            }
        },
        
        _onCollectionAddCompleted: function() {
            this._setHeightTranslateY();

            //  Give the items a second to appear and then update.
            requestAnimationFrame(function() {
                this.view.triggerMethod('UpdateScrollbar');
            }.bind(this));
        },

        _onCollectionChangeActive: function(item, active) {
            if (active) {
                this._scrollToItem(item);
            }
        }
    });

    return SlidingRender;
});